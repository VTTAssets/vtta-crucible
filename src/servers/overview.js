import ui from "../lib/ui.js";
import list from "./list.js";
import caddy from "../caddy/index.js";

const displayOverview = async () => {
  const servers = await list();

  ui.h2("Servers Overview");
  for (let server of servers) {
    ui.h3(server.hostname);
    if (server.process.id) {
      ui.log(
        `Process Manager (pm2): **ID${server.process.id}**, ${server.process.status}`,
        "success",
        true
      );
    } else {
      ui.log(`Process Manager (pm2): Not registered`, "error", true);
    }

    // const result = {
    //     hostname: server.hostname,
    //     configured: false,
    //     upstream: null,
    //     healthy: null,
    //   };
    if (server.proxy.configured) {
      ui.log(
        `Reverse Proxy (Caddy): ${upstream}, status: ${
          server.proxy.healthy ? "Healthy" : "Not healthy"
        }`
      );
    } else {
      ui.log(`Reverse Proxy (Caddy): Not registered`, "error", true);
      await caddy.create(server.hostname, server.port, server.process.id);
    }
  }
};

export default displayOverview;
