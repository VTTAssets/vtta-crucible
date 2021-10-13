import ui from "../lib/ui.js";
import pm2 from "pm2";

const start = (server) => {
  return new Promise(async (resolve, reject) => {
    // get all running crucible servers
    const serverList = await list();

    const serverProcess = serverList.find(
      (srv) => srv.name === server.hostname
    );

    if (!serverProcess) {
      return reject(`Server ${server.hostname} not found in pm2`);
    }

    const MODE = serverProcess.status === "online" ? "Restart" : "Start";

    pm2.connect((error) => {
      if (error) {
        ui.log("Cound not connect to pm2", "error");
        ui.log(
          "Please follow the installation instructions to install the node process manager pm2 and re-run this script"
        );
        return reject("Connection to process manager failed");
      }

      pm2.restart(serverProcess.id, { updateEnv: true }, async (err, apps) => {
        if (err) {
          ui.log(`${MODE}ing server ${server.name} failed`, "error");
          ui.log(err);
          return reject(`${MODE}ing server ${server.name} failed`);
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
      });
    });
  });
};

export default start;
