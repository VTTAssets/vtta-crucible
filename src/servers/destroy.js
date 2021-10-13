import env from "../lib/env.js";
import config from "../config.js";

import DO from "../digitalocean/index.js";
import ui from "../lib/ui.js";

import AdmZip from "adm-zip";

import * as fs from "fs";
import * as path from "path";

import downloadRelease from "../foundryvtt.com/downloadRelease.js";
import rimraf from "rimraf";
import mkdirp from "mkdirp";

import Caddy from "../caddy/index.js";
import pm2 from "../pm2/index.js";

/**
 * Destroys a server
 * @param {object} server Server object from environment
 */
const destroy = async (server) => {
  console.log("Destroying server ");
  console.log(server);
  const environment = await env.load();
  environment.servers = environment.servers.filter(
    (srv) => srv.hostname !== server.hostname
  );

  // ---------------------------------------------

  ui.log("Unregistering server with Caddy (reverse proxy)...");
  try {
    const success = await Caddy.destroy(server.hostname);
    if (success) {
      ui.log("Unregistering successful", success);
    } else {
      ui.log("Error unregistering server with Caddy", "error");
    }
  } catch (error) {
    ui.log("Error unregistering server with Caddy", "error");
    process.exit(1);
  }

  // ---------------------------------------------

  ui.log("Unregistering server with pm2...");
  try {
    const success = await pm2.destroy(server);
    if (success) {
      ui.log("Registraton successful", "success");
    } else {
      ui.log(`Registration failed`, "error");
    }
  } catch (error) {
    ui.log(`Registration failed: ${error.message}`, "error");
    ui.log(
      "I will continue, but you should list the running process with `pm2 list` to see where the issue is originating from."
    );
    process.exit(1);
  }

  // create the dns record
  ui.log("Unregistering DNS record...");
  try {
    const ipAddress = await DO.domains.deleteRecord(server.hostname);
    ui.log(
      `Unregistering DNS record for ${server.hostname} => ${ipAddress} in Digital Ocean's DNS succeeded.`,
      "success"
    );
  } catch (error) {
    console.log("Error: " + error);
    ui.log(
      `Unregistering DNS record for ${server.hostname} failed: ${error.message}.`,
      "error"
    );
    process.exit(7);
  }
  // ---------------------------------------------

  ui.log(`Installing Foundry VTT, release ${desiredRelease.name}...`);

  // create the directory structure necessary for this server
  rimraf.sync(`${config.store.servers}/${server.hostname}`);

  ui.log(
    `Deleted server directory structure at ${config.store.servers}/${server.hostname}`,
    "success"
  );

  // ---------------------------------------------

  // saving this server in the list
  await env.save(environment);

  // Summary
  ui.separator();
  ui.h1(`Server destroyed successfully`);
};

export default destroy;
