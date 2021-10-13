import * as path from "path";
import { writeFileSync } from "fs";
import reload from "./reload.js";
import config from "../config.js";

const create = async (hostname, port) => {
  const contents = `# Configuration created by Foundry VTT Installer
# Do not edit manually, as changes might get overwritten
# ----------------------------------------------------------------
# hostname: ${hostname}
# port: ${port}
# ----------------------------------------------------------------

${hostname} {
    reverse_proxy localhost:${port} {
      health_uri /icons/vtt.png
      health_status 200
      health_interval 2s
      health_timeout 10s
    }

    log {
	    output file /var/log/caddy/${hostname}-access.log
    }

    # Ramping max body size up for animated maps
    request_body {
        max_size 100MB
    }
}`;

  writeFileSync(
    path.resolve(config.store.caddyConfigs, `${hostname}.conf`),
    contents,
    {
      encoding: "utf-8",
    }
  );

  // reloading Caddy
  await reload();
  return true;
};

export default create;
