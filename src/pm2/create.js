import config from "../config.js";
import ui from "../lib/ui.js";
import pm2 from "pm2";

import save from "./save.js";

const create = (server) => {
  return new Promise((resolve, reject) => {
    pm2.connect((error) => {
      if (error) {
        ui.log("Cound not connect to pm2", "error");
        ui.log(
          "Please follow the installation instructions to install the node process manager pm2 and re-run this script"
        );
        return reject("Server registration failed");
      }

      pm2.start(
        {
          name: server.hostname,
          cwd: `${config.store.servers}/${server.hostname}/bin`,
          script: "resources/app/main.js",
          args: [
            `--dataPath="${config.store.servers}/${server.hostname}/data"`,
            `--port=${server.port}`,
            `--hostname=${server.hostname}`,
            "proxySSL=true",
            "proxyPort=443",
          ],
        },
        async (err, apps) => {
          if (err) {
            ui.log("Registering server within pm2 failed", "error");
            ui.log(err);
            return reject("Server registration failed within pm2");
          }
          await save();
          pm2.disconnect();
          const app = apps.length ? apps[0] : null;
          if (app) {
            return resolve({
              hostname: app.pm2_env.name,
              id: parseInt(app.pm2_env.pm_id),
              status: app.pm2_env.status,
            });
          }
          resolve(apps);
        }
      );
    });
  });
};

export default create;
