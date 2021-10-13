import config from "../config.js";
import mkdirp from "mkdirp";
import { existsSync, readFileSync, writeFileSync } from "fs";

import create from "./create.js";
import list from "./list.js";
import reload from "./reload.js";

const initialize = () => {
  if (!existsSync(config.store.caddyConfigs)) mkdirp(config.store.caddyConfigs);

  // check the Caddyfile for a reference to the caddyConfigs
  const contents = readFileSync(`/etc/caddy/Caddyfile`, { encoding: "utf-8" });
  const importDirective = `import ${config.store.caddyConfigs}/*`;
  const regexp = new RexExp(importDirective);
  if (contents.search(regexp) === -1) {
    contents += importDirective;
    writeFileSync("/etc/caddy/Caddyfile", contents, { encoding: "utf-8" });
    reload();
  }
};

initialize();

export default {
  create,
  list,
};
