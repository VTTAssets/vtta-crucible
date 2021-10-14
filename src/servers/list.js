import pm2 from "../pm2/index.js";
import Caddy from "../caddy/index.js";
import env from "../lib/env.js";

import ui from "../lib/ui.js";

const list = () => {
  return new Promise(async (resolve, reject) => {
    const environment = env.load();
    const processes = await pm2.list();
    const proxies = await Caddy.list();

    console.log("Server.list");
    console.log(processes);
    console.log(proxies);

    // go through all configured servers
    const servers = environment.servers.map((server) => {
      server.process = processes.find(
        (proc) => proc.hostname === server.hostname
      );
      server.proxy = proxies.find(
        (proxy) => proxy.hostname === server.hostname
      );

      delete server.process.hostnmame;
      delete server.proxy.hostname;

      return server;
    });

    resolve(servers);
  });
};

export default list;
