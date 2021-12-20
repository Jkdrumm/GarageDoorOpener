import express from "express";
import fs from "fs";
import http from "http";
import https from "https";
import expressWs from "express-ws";
import passport from "passport";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import path from "path";
import connectEnsureLogin from "connect-ensure-login";
import expressSession from "express-session";
import { Gpio } from "onoff";
import UserDetails from "./src/server/model/UserDetails.js";
import accountDetails from "./src/server/post/accountDetails.js";
import autoUpdater from "./src/server/services/autoUpdater.js";
import __dirname from "./src/server/services/dirname.js";
import GarageState from "./src/server/model/GarageState.js";
import AdminLevel from "./src/server/model/AdminLevel.js";
import {
  doorState,
  webSocketClients,
  setDoorState,
} from "./src/server/services/webSocket.js";
const app = express();
const HTTP_PORT = process.env.HTTP_PORT || 80;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;
const DOMAIN_NAME = "spookygang.serveminecraft.net";
const sessionTimeoutTime = 3600000;
const session = expressSession({
  secret: "secret",
  resave: true,
  rolling: true,
  saveUninitialized: false,
  cookie: { maxAge: sessionTimeoutTime },
});

let closed,
  open = false;
let pressButton = () => {};
try {
  const closedSensor = new Gpio(16, "in", "both");
  const openSensor = new Gpio(18, "in", "both");
  const garageSwitch = new Gpio(7, "out");

  closedSensor.watch((error, value) => {
    if (error) console.error(error);
    else closed = value === 1;
    console.log(value);
  });

  openSensor.watch((error, value) => {
    if (error) console.error(error);
    else open = value === 1;
    console.log(value);
  });

  pressButton = async () => {
    garageSwitch.writeSync(0);
    setTimeout(() => garageSwitch.writeSync(1), 1000);
  };
} catch (error) {
  console.error(error);
}

const httpServer = http
  .createServer(app)
  .listen(HTTP_PORT, () => console.log(`Server listening on ${HTTP_PORT}`));
let httpsServer = null;

try {
  httpsServer = https
    .createServer(
      {
        key: fs.readFileSync(
          `${__dirname}certificates\\${DOMAIN_NAME}\\privkey.pem`
        ),
        cert: fs.readFileSync(
          `${__dirname}certificates\\${DOMAIN_NAME}\\fullchain.pem`
        ),
      },
      app
    )
    .listen(HTTPS_PORT, () => console.log(`Server listening on ${HTTPS_PORT}`));
  expressWs(app, httpsServer);
} catch (e) {
  console.log(
    "ERROR: Unable to create HTTPS server. Are you missing certificate keys?"
  );
}
expressWs(app, httpServer);

app.use(session);
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

mongoose.connect("mongodb://localhost/Garage", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

passport.use(UserDetails.createStrategy());

passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

app.ws("/ws", (ws, req) => {
  const session = req.session;
  if (session) {
    const expireDate = new Date(session.cookie._expires);
    if (expireDate >= new Date()) {
      ws.expireDate = expireDate;
      if (webSocketClients[req.user._id] === undefined) {
        ws.requestIndex = 0;
        webSocketClients[req.user._id] = {
          level: req.user.level,
          connections: [ws],
        };
      } else {
        ws.requestIndex = webSocketClients[req.user._id].connections.length;
        webSocketClients[req.user._id].connections.push(ws);
      }
      const payload = [];
      payload.push({
        event: "SESSION_TIMEOUT_LENGTH",
        message: sessionTimeoutTime,
      });
      if (webSocketClients[req.user._id].level >= AdminLevel.VIEWER)
        payload.push({ event: "STATE", message: doorState });
      ws.send(JSON.stringify(payload));
      ws.on("message", (message) => {
        if (webSocketClients[req.user._id].level >= AdminLevel.USER)
          if (message === "PRESS") {
            pressButton();
            setDoorState(
              doorState === GarageState.OPEN
                ? GarageState.CLOSED
                : GarageState.OPEN
            );
          }
      });
      ws.on("close", () => {
        const requestIndex = ws.requestIndex;
        webSocketClients[req.user._id].connections.splice(requestIndex, 1);
        const socketArrayLength =
          webSocketClients[req.user._id].connections.length;
        if (socketArrayLength > 0)
          for (let i = requestIndex; i < socketArrayLength; i++)
            webSocketClients[req.user._id].connections[i].requestIndex--;
        else delete webSocketClients[req.user._id];
      });
    }
  } else ws.close();
});

const checkPermission = (adminLevel) => (req, res, next) =>
  connectEnsureLogin.ensureLoggedIn()(req, res, () => {
    if (req.user.level >= adminLevel) next();
    else return res.sendStatus(403);
  });

const setAdminCookie = () => (req, res, next) =>
  connectEnsureLogin.ensureLoggedIn()(req, res, () => {
    const adminCookie = req.cookies.level;
    if (adminCookie === undefined || adminCookie !== req.user.level)
      res.cookie("level", req.user.level);
    next();
  });

const removeAdminCookie = () => (req, res, next) =>
  connectEnsureLogin.ensureLoggedOut()(req, res, () => {
    const adminCookie = req.cookies.level;
    if (adminCookie !== undefined)
      res.clearCookie("level", {
        path: "/",
      });
    next();
  });

// const checkPermissionWithCookie =
//   (adminLevel) => (req, res, next) =>
//     connectEnsureLogin.ensureLoggedIn()(req, res, () => {
//       if (req.user.level >= adminLevel) setAdminCookie()(req, res, next);
//       else return res.sendStatus(403);
//     });

["login", "createAccount"].forEach((route) => {
  app.get(`/${route}`, removeAdminCookie(), (_req, res) =>
    res.sendFile(path.join(__dirname, "build", "index.html"))
  );
});

["account", "settings", "userSettings", ""].forEach((route) => {
  app.get(`/${route}`, setAdminCookie(), (_req, res) =>
    res.sendFile(path.join(__dirname, "build", "index.html"))
  );
});

app.get("/users", checkPermission(AdminLevel.ADMIN), (_req, res) =>
  UserDetails.find({}, (error, users) => {
    if (error) throw error;
    users = users.map((user) => {
      return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
      };
    });
    return res.json(users);
  })
);

// TODO
app.get("/currentSettings", checkPermission(AdminLevel.ADMIN), (_req, res) => {
  autoUpdater
    .compareVersions()
    .then(({ upToDate, currentVersion, remoteVersion }) => {
      console.log(upToDate, currentVersion, remoteVersion);
      return res.json({ upToDate, currentVersion, remoteVersion });
    });
});

app.post("/downloadUpdate", checkPermission(AdminLevel.ADMIN), (_req, res) => {
  autoUpdater.autoUpdate().then(() => res.redirect("/login"));
});

app.post("/login", removeAdminCookie(), (req, res, next) =>
  passport.authenticate("local", (error, user, info) => {
    if (error) return res.json(error);
    if (!user) return res.json(info);
    req.logIn(user, (error) => {
      if (error) return res.json(error);
      return res.redirect("/");
    });
  })(req, res)
);

app.post("/createAccount", removeAdminCookie(), async (req, res, next) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const username = req.body.username;
  const password = req.body.password;

  const validationErrors = validateNewAccount(
    firstName,
    lastName,
    username,
    password
  );
  if (validationErrors === null) {
    const owner = await UserDetails.findOne({ level: 4 }).exec();
    UserDetails.register(
      {
        firstName: firstName,
        lastName: lastName,
        username: username,
        level: owner === null ? AdminLevel.OWNER : AdminLevel.USER,
        active: false,
      },
      password
    )
      .then(() => {
        passport.authenticate("local", (error, user, info) => {
          if (error) return res.json(error);
          if (!user) return res.json(info);
          req.logIn(user, (error) => {
            if (error) return res.json(error);
            return res.redirect("/");
          });
        })(req, res, next);
      })
      .catch((error) => {
        const response = {
          field: error.name === "UserExistsError" ? "username" : undefined,
          message: error.message,
        };
        return res.json(response);
      });
  } else return res.json({ fields: validationErrors });
});

app.get("/logout", connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  req.logout();
  res.status(200).clearCookie("connect.sid", {
    path: "/",
  });
  res.status(200).clearCookie("level", {
    path: "/",
  });
  req.session.destroy(function (err) {
    res.redirect("/login");
  });
});

app.get(
  "/accountDetails",
  connectEnsureLogin.ensureLoggedIn(),
  async (req, res) => {
    const userId = req.query.id;
    let user = null;
    if (userId && userId !== req.user._id) {
      if (req.user.level >= AdminLevel.ADMIN)
        try {
          user = { ...(await UserDetails.findById(userId).exec())._doc };
        } catch (error) {
          return res.json({ message: "User not found" });
        }
      else return res.sendStatus(403);
    } else user = { ...req.user._doc };
    if (user !== null) {
      user.isCurrentUser = user._id.equals(req.user._id);
      delete user._id;
      delete user.__v;
      return res.json(user);
    } else return res.json({ message: "User not found" });
  }
);

app.post(
  "/accountDetails",
  checkPermission(AdminLevel.ADMIN),
  async (req, res, next) => accountDetails(req, res, next, webSocketClients)
);

app.use(express.static("build"));

app.use((_req, res) =>
  res.status(404).sendFile("build/index.html", { root: __dirname })
);

const validateNewAccount = (firstName, lastName, username, password) => {
  const firstNameError = firstName.length === 0;
  const lastNameError = lastName.length === 0;
  const usernameError = username.length === 0;
  const passwordError = password.length < 8 || password.length > 20;

  if (!(firstNameError || lastNameError || usernameError || passwordError))
    return null;

  const errors = [];
  if (firstNameError) errors.push("firstName");
  if (lastNameError) errors.push("lastName");
  if (usernameError) errors.push("username");
  if (passwordError) errors.push("password");
  return errors;
};
