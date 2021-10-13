import config from "../../../config.js";

import mkdirp from "mkdirp";
import * as path from "path";
import { existsSync, unlinkSync } from "fs";

const createFolders = () => {
  // cookie path
  let targetPath = path.dirname(path.resolve(config.store.cookies));
  if (!existsSync(targetPath)) {
    mkdirp.sync(targetPath);
  }

  // removing cookies to not use old info
  targetPath = path.resolve(config.store.cookies);
  if (existsSync(targetPath)) {
    unlinkSync(targetPath);
  }

  targetPath = path.dirname(path.resolve(config.store.env));
  if (!existsSync(targetPath)) {
    mkdirp.sync(targetPath);
  }

  targetPath = path.resolve(config.store.releases);
  if (!existsSync(targetPath)) {
    mkdirp.sync(targetPath);
  }
  targetPath = path.resolve(config.store.servers);
  if (!existsSync(targetPath)) {
    mkdirp.sync(targetPath);
  }
};

export default createFolders;
