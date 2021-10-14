import api from "./api.js";
import { writeFileSync } from "fs";

import caddyConfigs from "./caddyConfigs/index.js";

const create = async (hostname, port, pm2Id) => {
  console.log(`Caddy.create(${hostname}, ${port}, ${pm2Id}`);

  const config = caddyConfigs.create(hostname, port, pm2Id);

  console.log("Config created");
  writeFileSync(`${hostname}-config.json`, JSON.stringify(config, null, 3), {
    encoding: "utf-8",
  });
  console.log(`stored at ${hostname}-config.json`);
  const result = await api.post("/load", config);
  console.log("Result from Caddy API call");
  console.log(result);
  return result;
};

export default create;
