import config from "../config.js";
import ui from "../lib/ui.js";
import pm2 from "pm2";
import env from "../lib/env.js";

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

        const servers = env.load().servers;

        resolve(
          servers.map((server) => {
            const config = apps.find(
              (app) => app.pm2_env.name === server.hostname
            );
            if (config) {
              return {
                hostname: server.hostname,
                id: parseInt(config.pm2_env.pm_id),
                status:
                  config.pm2_env.status === "online"
                    ? "running"
                    : config.pm2_env.status,
                resources: config.monit
                  ? {
                      memory: Math.ceil(config.monit.memory / 1024 / 1024),
                      cpu: config.monit.cpu,
                    }
                  : { memory: null, cpu: null },
              };
            } else {
              return {
                hostname: server.hostname,
                id: null,
                status: "not registered",
                resources: { memory: null, cpu: null },
              };
            }
          })
        );
      });
    });
  });
};

export default list;
