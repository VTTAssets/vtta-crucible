import { exec } from "child_process";

const reload = () => {
  return new Promise((resolve, reject) => {
    exec("service caddy reload", (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
        return;
      } else {
        resolve(true);
      }
    });
  });
};

export default reload;
