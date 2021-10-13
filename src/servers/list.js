import pm2 from "pm2";
import { success, fail } from "../lib/prompts.js";

const list = async () => {
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) {
        fail(
          "Could not connect to Node Process Manager PM2, did you install it?"
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
