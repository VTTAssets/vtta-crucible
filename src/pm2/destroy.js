import ui from "../lib/ui.js";
import pm2 from "pm2";
import list from "./list.js";
import save from "./save.js";

const destroy = (server) => {
  return new Promise(async (resolve, reject) => {
    const processList = await list();

    const toDelete = processList.find(
      (proc) => proc.hostname === server.hostname
    );

    if (!toDelete) {
      ui.log("Did not find a running process for " + server.hostname, "warn");
      return resolve(false);
    }

    pm2.connect((error) => {
      if (error) {
        ui.log("Cound not connect to pm2", "error");
        ui.log(
          "Please follow the installation instructions to install the node process manager pm2 and re-run this script"
        );
        resolve(false);
      }

      pm2.delete(toDelete.id, async (err, _) => {
        if (err) {
          ui.log("Server deletion with pm2 failed", "error");
          ui.log(err);
          return resolve(false);
        }
        await save();
        pm2.disconnect();
        return resolve(true);
      });
    });
  });
};

export default destroy;
