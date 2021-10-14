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

import portscanner from "portscanner";

const findNextFreePort = () => {
  return new Promise((resolve, reject) => {
    portscanner.findAPortNotInUse(30000, 31000, (error, port) => {
      resolve(port);
    });
  });
};

const create = async (serverConfig) => {
  const environment = await env.load();
  // {
  //   domainName: 'oneshot-tavern.com',
  //   subdomainName: 'test',
  //   release: 255,
  //   licenseKey: '5CXG-UIUL-BLVG-W06S-ZW0Q-TWT7'
  // }

  const server = {
    name: serverConfig.subdomainName,
    hostname: `${serverConfig.subdomainName}.${serverConfig.domainName}`,
    assignedLicense: serverConfig.licenseKey,
    release: serverConfig.release,
    port: null,
  };

  // update the port number
  server.port = await findNextFreePort();

  // add this server to the list of servers for now
  environment.servers.push(server);

  // create the dns record
  ui.log("Creating DNS record...");
  try {
    const ipAddress = await DO.domains.createRecord(
      environment.credentials.digitalOcean.personalAccessToken,
      serverConfig.domainName,
      serverConfig.subdomainName
    );
    ui.log(
      `DNS registration for ${server.hostname} => ${ipAddress} in Digital Ocean's DNS succeeded.`,
      "success"
    );
  } catch (error) {
    console.log("Error: " + error);
    ui.log(
      `DNS registration for ${server.hostname} failed: ${error.message}.`,
      "error"
    );
    process.exit(7);
  }

  const desiredRelease = environment.meta.foundryVtt.releases.find(
    (release) => release.build === serverConfig.release
  );

  // ---------------------------------------------

  ui.log(`Installing Foundry VTT, release ${desiredRelease.name}...`);

  // create the directory structure necessary for this server
  rimraf.sync(`${config.store.servers}/${server.hostname}`);
  mkdirp.sync(`${config.store.servers}/${server.hostname}`);
  mkdirp.sync(`${config.store.servers}/${server.hostname}/bin`);
  mkdirp.sync(`${config.store.servers}/${server.hostname}/data`);
  mkdirp.sync(`${config.store.servers}/${server.hostname}/data/Config`);
  ui.log(
    `Created server directory structure at ${config.store.servers}/${server.hostname}`,
    "success"
  );

  // download the Foundry release, if necessary
  if (!fs.existsSync(`${config.store.releases}/${desiredRelease.build}.zip`)) {
    ui.log("Release not found in local libray, starting import...");
    await downloadRelease(desiredRelease);
    ui.log("Imported release build to local library", "success");
  } else {
    ui.log("Release found in local libray, no download necessary.");
  }

  const archive = new AdmZip(
    `${config.store.releases}/${desiredRelease.build}.zip`
  );

  // ---------------------------------------------
  ui.log("Extracting Foundry VTT release (this may take a moment)...");
  await archive.extractAllTo(`${config.store.servers}/${server.hostname}/bin`);
  ui.log("Extracted Foundry VTT server binary", "success");

  // ---------------------------------------------

  // pm2 config for this server
  ui.log("Creating pm2 environment configuration for manual registration...");
  const ecosystem = `module.exports = {
    apps : [{
      name: "${server.hostname}",
      script: "resources/app/main.js",
      args: ["--dataPath=${path.resolve(
        `${config.store.servers}/${server.hostname}`
      )}/data", "--port=${server.port}", "--hostname=${
    server.hostname
  }", "proxySSL=true", "proxyPort=443"],
      cwd: "${path.resolve(`${config.store.servers}/${server.hostname}`)}/bin",
    }],
  };`;

  fs.writeFileSync(
    `${config.store.servers}/${server.hostname}/ecosystem.config.js`,
    ecosystem,
    { encoding: "utf-8" }
  );
  ui.log("pm2 environment configuration created", "success");

  // ---------------------------------------------
  ui.log("Creating Foundry VTT license file...");
  const license = {
    host: `${server.hostname}`,
    license: serverConfig.licenseKey.replace(/-/g, ""),
  };

  fs.writeFileSync(
    `${config.store.servers}/${server.hostname}/data/Config/license.json`,
    JSON.stringify(license, null, 3),
    { encoding: "utf-8" }
  );
  ui.log("FVTT license file created", "success");

  // ---------------------------------------------

  ui.log("Creating Foundry VTT configuration file...");
  const options = {
    port: server.port,
    upnp: true,
    fullscreen: false,
    hostname: `${server.hostname}`,
    localHostname: null,
    routePrefix: null,
    sslCert: null,
    sslKey: null,
    awsConfig: serverConfig.spacesEnabled ? config.store.spacesConfig : null,
    dataPath: `${path.resolve(
      `${config.store.servers}/${server.hostname}`
    )}/data`,
    proxySSL: true,
    proxyPort: 443,
    minifyStaticFiles: false,
    updateChannel: "stable",
    language: "en.core",
    upnpLeaseDuration: null,
    world: null,
  };

  fs.writeFileSync(
    `${config.store.servers}/${server.hostname}/data/Config/options.json`,
    JSON.stringify(options, null, 3),
    { encoding: "utf-8" }
  );
  ui.log("Foundry VTT configuration file created", "success");

  // ---------------------------------------------

  try {
    await Caddy.create(server.hostname, server.port);
    ui.log("Configuring Caddy (reverse proxy)...");
  } catch (error) {
    ui.log("Error configuring Caddy", "error");
    process.exit(1);
  }

  // ---------------------------------------------

  ui.log("Registering server at pm2...");
  try {
    const serverRuntime = await pm2.create(server);
    ui.log("Registraton successful", "success");
  } catch (error) {
    ui.log(`Registration failed: ${error.message}`, "error");
    ui.log(
      "I will continue, but you should list the running process with `pm2 list` to see where the issue is originating from."
    );
    process.exit(1);
  }

  // saving this server in the list
  await env.save(environment);

  // Summary
  ui.separator();
  ui.h1(`Server created successfully`);

  ui.h2("Environment");
  ui.log(`  URL: https://${server.hostname}
  User data: ${config.store.servers}/${server.hostname}/data
  
  Enjoy your games!
  `);

  process.exit(0);
};

export default create;
