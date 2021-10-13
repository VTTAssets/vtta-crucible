import * as path from "path";
import { existsSync, unlinkSync } from "fs";
import reload from "./reload.js";
import config from "../config.js";

const destroy = async (hostname, port) => {
  const caddyConfig = path.resolve(
    config.store.caddyConfigs,
    `${hostname}.conf`
  );
  if (existsSync(caddyConfig)) {
    unlinkSync(caddyConfig);
    await reload();
  }

  return true;
};

export default destroy;
