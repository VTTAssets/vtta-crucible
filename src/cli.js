#!/usr/bin/env node

import config from "./config.js";
import createLogger from "./lib/logging.js";

import Screens from "./lib/prompts/index.js";

import docopt from "docopt";
import env from "./lib/env.js";
import Menu from "./lib/menu.js";

const doc = `
Installs and manages Foundry VTT running inside a Digital Ocean Droplet, with optional
Digital Ocean Spaces integration and configuration.

This utility stores credentials in a file read/write-able by the currently logged-in
user to ${config.store.env}.

Usage:
  index.js [--log-level=LEVEL] 
  index.js (-h | --help)
Options:
  -h --help              Show this message.
  --log-level=LEVEL      If specified, then the log level will be set to
                         the specified value.  Valid values are "debug", "info",
                         "warn", and "error". [default: error]
  --skip-setup           If specified, the setup check on startup will be skipped
`;

let logger;

const getOptions = () => {
  let cmd = docopt.docopt(doc, { version: "1.0.0" });
  return {
    logLevel: cmd["--log-level"].toLowerCase(),
    skipSetup: cmd["--skip-setup"] ? true : false,
  };
};

const main = async () => {
  const options = getOptions();
  if (!options.skipSetup) await Screens.setup();

  await Menu.show();
  return;

  logger = createLogger("Main", options.logLevel);

  let environment = env.load();

  await setup();

  // checking all pre-requisites, like authentication and stuff
  environment = await checkEnvironment(environment, options);

  // initializing the app
  const menu = await Menu.build();
  menu.show();
};

main();
