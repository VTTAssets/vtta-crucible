import { exec } from "child_process";

const reload = () => {
  return new Promise((resolve, reject) => {
    exec(
      "/usr/bin/caddy reload -config /etc/caddy/Caddyfile",
      (error, stdout, stderr) => {
        if (error) {
          reject(error.message);
          return;
        } else {
          console.log(stdout);

          resolve(true);
        }
      }
    );
  });
};

export default reload;
