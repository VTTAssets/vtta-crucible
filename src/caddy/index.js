import config from "../config.js";
import mkdirp from "mkdirp";
import { existsSync } from "fs";

import create from "./create.js";
import list from "./list.js";

const initialize = () => {
  if (!existsSync(config.store.caddyConfigs)) mkdirp(config.store.caddyConfigs);
};

initialize();

export default {
  create,
  list,
};
