import config from "../config.js";
import ui from "../lib/ui.js";
import pm2 from "pm2";

const list = () => {
  return new Promise((resolve, reject) => {
    pm2.connect((error) => {
      if (error) {
        ui.log("Cound not connect to pm2", "error");
        ui.log(
          "Please follow the installation instructions to install the node process manager pm2 and re-run this script"
        );
        return reject("pm2 connection failed");
      }

      pm2.list((err, apps) => {
        if (err) {
          ui.log("Registering server within pm2 failed", "error");
          ui.log(err);
          pm2.disconnect();
          return reject("Server registration failed within pm2");
        }
        pm2.disconnect();

        const condensedList = apps
          .filter((app) => {
            return app.pm2_env.cwd.indexOf(config.store.servers) !== -1;
          })
          .map((app) => {
            return {
              hostname: app.pm2_env.name,
              id: parseInt(app.pm2_env.pm_id),
              status: app.pm2_env.status,
              resources: {
                memory: Math.ceil(app.monit.memory / 1024 / 1024),
                cpu: app.monit.cpu,
              },
            };
          });

        resolve(condensedList);
      });
    });
  });
};

export default list;
