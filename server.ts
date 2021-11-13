const express = require("express");
const app = express();
const fs = require("fs");
const http = require("http");
const https = require("https");
const expressWs = require("express-ws");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const path = require("path");
const HTTP_PORT = process.env.HTTP_PORT || 80;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;
const CERTBOT_LIVE_DIRECTORY = "C:\\Certbot\\live";
const DOMAIN_NAME = "spookygang.serveminecraft.net";
const sessionTimeoutTime = 3600000;
const expressSession = require("express-session")({
  secret: "secret",
  resave: true,
  rolling: true,
  saveUninitialized: false,
  cookie: { maxAge: sessionTimeoutTime }, // 3600000
});
const connectEnsureLogin = require("connect-ensure-login");

const httpServer = http
  .createServer(app)
  .listen(HTTP_PORT, () => console.log(`Server listening on ${HTTP_PORT}`));
let httpsServer = null;

try {
  httpsServer = https
    .createServer(
      {
        key: fs.readFileSync(
          `${CERTBOT_LIVE_DIRECTORY}\\${DOMAIN_NAME}\\privkey.pem`
        ),
        cert: fs.readFileSync(
          `${CERTBOT_LIVE_DIRECTORY}\\${DOMAIN_NAME}\\fullchain.pem`
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

app.use(expressSession);
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

mongoose.connect("mongodb://localhost/Garage", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Schema = mongoose.Schema;
const UserDetail = new Schema({
  firstName: String,
  lastName: String,
  username: String,
  password: String,
  level: Number,
});

const AdminLevel = Object.freeze({
  OWNER: 4, //   (Owner)      - Cannot have any privelidges removed. Can demote admins
  ADMIN: 3, //   (Admin)      - Can access the admin portal and all of its functions. Can change user admin level up to admin. Cannot demote other admins.
  USER: 2, //    (User)       - Can open/close the garage door
  VIEWER: 1, //  (Viewer)     - Can only view the status of the garage door
  ACCOUNT: 0, // (Account)    - Can view and modify their account information, and delete their account
});

const GarageState = Object.freeze({
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  UNKNOWN: "PARTIALLY OPEN/CLOSED",
  SESSION_TIMEOUT: "SESSION TIMED OUT",
});

const options = {
  errorMessages: {
    MissingPasswordError: "No password was given",
    AttemptTooSoonError: "Account is currently locked. Try again later",
    TooManyAttemptsError:
      "Account locked due to too many failed login attempts",
    NoSaltValueStoredError: "Authentication not possible. No salt value stored",
    IncorrectPasswordError: "Password or username are incorrect",
    IncorrectUsernameError: "Password or username are incorrect",
    MissingUsernameError: "No username was given",
    UserExistsError: "A user with the given username is already registered",
  },
};
UserDetail.plugin(passportLocalMongoose, options);
const UserDetails = mongoose.model("userInfo", UserDetail, "userInfo");

passport.use(UserDetails.createStrategy());

passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

let doorState = GarageState.OPEN;

let webSocketClients = {};
const notifyDoorState = () => {
  const connectionsToClose = [];
  for (const [id1, singleUserArray] of Object.entries(webSocketClients))
    for (const [id2, ws] of Object.entries(singleUserArray))
      if (ws.expireDate >= new Date()) ws.send(doorState);
      else connectionsToClose.push(ws);
  connectionsToClose.forEach((ws) => {
    ws.send(GarageState.SESSION_TIMEOUT);
    ws.close();
  });
};

const setDoorState = (newState) => {
  doorState = newState;
  notifyDoorState();
};

app.ws("/ws", (ws, req) => {
  if (req.user && req.user.level >= AdminLevel.VIEWER) {
    const session = req.session;
    if (session) {
      const expireDate = new Date(session.cookie._expires);
      if (expireDate >= new Date()) {
        ws.expireDate = expireDate;
        if (webSocketClients[req.user._id] === undefined) {
          ws.requestIndex = 0;
          webSocketClients[req.user._id] = [ws];
        } else {
          ws.requestIndex = webSocketClients[req.user._id].length;
          webSocketClients[req.user._id].push(ws);
        }
        ws.send(sessionTimeoutTime);
        ws.send(doorState);
        if (req.user.level >= AdminLevel.USER)
          ws.on("message", (message) => {
            if (message === "PRESS")
              setDoorState(
                doorState === GarageState.OPEN
                  ? GarageState.CLOSED
                  : GarageState.OPEN
              );
          });

        ws.on("close", () => {
          const requestIndex = ws.requestIndex;
          webSocketClients[req.user._id].splice(requestIndex, 1);
          const socketArrayLength = webSocketClients[req.user._id].length;
          if (socketArrayLength > 0)
            for (let i = requestIndex; i < socketArrayLength; i++)
              webSocketClients[req.user._id][i].requestIndex--;
          else delete webSocketClients[req.user._id];
        });
      }
    } else ws.close();
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

const checkPermissionWithCookie = (adminLevel) => (req, res, next) =>
  connectEnsureLogin.ensureLoggedIn()(req, res, () => {
    if (req.user.level >= adminLevel) setAdminCookie()(req, res, next);
    else return res.sendStatus(403);
  });

["login", "createAccount"].forEach((route) => {
  app.get(`/${route}`, removeAdminCookie(), (req, res) =>
    res.sendFile(path.join(__dirname, "build", "index.html"))
  );
});

["account", "settings", "userSettings", ""].forEach((route) => {
  app.get(`/${route}`, setAdminCookie(), (req, res) =>
    res.sendFile(path.join(__dirname, "build", "index.html"))
  );
});

app.get("/users", checkPermission(AdminLevel.ADMIN), (req, res) =>
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
// app.get("/currentSettings");

app.post("/login", removeAdminCookie(), (req, res) =>
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

app.use(express.static("build"));

app.use((req, res, next) =>
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
