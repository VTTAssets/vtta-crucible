import pm2 from "pm2";
import ui from "../lib/ui.js";

const list = async () => {
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) {
        ui.log(
          "Could not connect to Node Process Manager PM2, did you install it?",
          "error"
        );
        process.exit(6);
      }

      pm2.list((err, list) => {
        resolve(list);
      });
    });
  });
};

export default list;
