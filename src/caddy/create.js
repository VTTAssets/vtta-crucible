import api from "./api.js";

import caddyConfigs from "./caddyConfigs/index.js";

const create = async (hostname, port, pm2Id) => {
  const config = caddyConfigs.create(hostname, port, pm2Id);
  const result = await api.post("/load", config);
  return result;
};

export default create;
