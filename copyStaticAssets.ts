console.log("Copying static assets");
const shell = require("shelljs");

shell.cp("-R", "src/public/", "dist");
shell.cp("-R", "src/common/time-ago-locale", "artifacts/common");
shell.cp("-R", "src/common/time-ago-locale", "build/common");