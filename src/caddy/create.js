import api from "./api.js";
import { writeFileSync } from "fs";

import caddyConfigs from "./caddyConfigs/index.js";

const create = async (hostname, port, pm2Id) => {
  const config = caddyConfigs.create(hostname, port, pm2Id);

  writeFileSync(`${hostname}-config.json`, JSON.stringify(config, null, 3), {
    encoding: "utf-8",
  });

  const result = await api.post("load", config);
  return result;
};

export default create;
