import config from "../config.js";
import createLogger from "../lib/logging.js";

import mkdirp from "mkdirp";
import * as path from "path";
import { existsSync } from "fs";

let logger;

const prepareFolders = () => {
  // cookie path
  let targetPath = path.dirname(path.resolve(config.store.cookies));
  if (!existsSync(targetPath)) {
    mkdirp.sync(targetPath);
    logger.info("Storage folder for cookies created");
  }

  targetPath = path.dirname(path.resolve(config.store.env));
  if (!existsSync(targetPath)) {
    mkdirp.sync(targetPath);
    logger.info("Storage folder for environment created");
  }

  targetPath = path.resolve(config.store.releases);
  if (!existsSync(targetPath)) {
    mkdirp.sync(targetPath);
    logger.info("Storage folder for FVTT releases created");
  }
  targetPath = path.resolve(config.store.servers);
  if (!existsSync(targetPath)) {
    mkdirp.sync(targetPath);
    logger.info("Storage folder for FVTT servers created");
  }
};

export default async () => {
  logger = createLogger("Setup", config.logging.level);
  prepareFolders();
};
