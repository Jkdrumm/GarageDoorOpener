import AutoGitUpdate from "auto-git-update";
import __dirname from "./dirname.js";

const config = {
  repository: "https://github.com/Jkdrumm/GarageDoorOpener",
  tempLocation: `${__dirname}/backup`,
  ignoreFiles: ["readme.md", "tsconfig.json", ".gitignore"],
  executeOnComplete: "npm run redeploy",
  exitOnComplete: true,
};

const autoUpdater = new AutoGitUpdate(config);
autoUpdater.setLogConfig({
  logGeneral: process.env.NODE_ENV === "development",
});

export default autoUpdater;
