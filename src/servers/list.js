import pm2 from "../pm2/index.js";
import Caddy from "../caddy/index.js";
import env from "../lib/env.js";

import ui from "../lib/ui.js";

const list = () => {
  return new Promise(async (resolve, reject) => {
    const environment = env.load();
    const processList = await pm2.list();
    const configList = await Caddy.list();

    // go through all configured servers
    const servers = environment.servers.map((server) => {
      let result = processList.find((srv) => srv.name === server.hostname);
      if (result) {
        Object.assign(server, result);
      }
      result = configList.find((srv) => srv.name === server.hostname);
      if (result) {
        Object.assign(server, result);
      }
      return server;
    });

    console.log(servers);

    resolve(servers);
  });
};

export default list;
