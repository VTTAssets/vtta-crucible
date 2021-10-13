import ui from "../lib/ui.js";
import { exec } from "child_process";

const save = () => {
  return new Promise((resolve, reject) => {
    exec("/usr/bin/pm2 save", (error, stdout, stderr) => {
      if (error) {
        ui.log("Error saving pm2 process list", "error");
        console.log(error.message);
        process.exit(10);
      }
      if (stderr) {
        ui.log("pm2 reported an error on saving the process list", "error");
        console.log(stderr);
        process.exit(11);
      }
      ui.log("Saved the pm2 process list successfully", "success");
      resolve(true);
    });
  });
};

export default save;
