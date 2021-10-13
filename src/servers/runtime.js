import config from "../config.js";
import ui from "../lib/ui.js";
import { exec } from "child_process";
import pm2 from "pm2";

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

const register = async (server) => {
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
            "--dataPath=`${config.store.servers}/${server.hostname}/data}`",
            "--port=${server.port}",
            "--hostname=${server.hostname}",
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
          resolve(apps);
        }
      );
    });
  });
};

const start = async (id) => {
  const serverList = await list();
  const server = serverList.find((srv) => srv.id === id);

  if (server) {
    if (server.status !== "online") {
      return new Promise((resolve, reject) => {
        pm2.connect((error) => {
          if (error) {
            ui.log("Cound not connect to pm2", "error");
            ui.log(
              "Please follow the installation instructions to install the node process manager pm2 and re-run this script"
            );
            return reject("Connection to process manager failed");
          }

          pm2.restart(server.id, { updateEnv: true }, async (err, apps) => {
            if (err) {
              ui.log(`(Re)starting server ${server.name} failed`, "error");
              ui.log(err);
              return reject(`(Re)starting server ${server.name} failed`);
            }
            await save();
            pm2.disconnect();
            resolve(apps);
          });
        });
      });
    }
  }
};

const list = () => {
  const environment = await env.load();
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
            console.log(app);
            return {
              hostname: app.name,
              id: parseInt(app.pm_id),
              status: app.pm2_env.status,
              ressources: {
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

export default { register, list, start, save };
