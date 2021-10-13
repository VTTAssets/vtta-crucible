import config from "../config.js";

import fetch from "node-fetch";
import * as fs from "fs";
import * as path from "path";

const API_PORT = 2019;

/**
 * Retrieves Health information for upstream reverse_proxies from Caddy
 * Maps it to previously retrieved basic details
 */
const health = async (configs) => {
  return new Promise((resolve, reject) => {
    fetch(`http://localhost:${API_PORT}/reverse_proxy/upstreams`)
      .then((response) => {
        if (response.ok) return response.json();
      })
      .then((json) => {
        for (let info of json) {
          const config = configs.find(
            (config) => config.upstream === info.address
          );
          if (config) {
            delete info.address; // duplicate info with .upstream
            Object.assign(config, info);
          }
        }
        resolve(configs);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

/**
 * Retrieves a list of configured reverse_proxies
 */
const list = async () => {
  // filter the found configuration with fvtt configs we created
  const configFiles = fs
    .readdirSync(config.store.caddyConfigs, {
      withFileTypes: true,
    })
    .filter((entry) => entry.isFile)
    .map((entry) => entry.name);

  const configs = [];
  for (let configFile of configFiles) {
    const contents = fs.readFileSync(
      path.resolve(config.store.caddyConfigs, configFile),
      { encoding: "utf-8" }
    );

    const lines = contents.split("\n");

    // # hostname: ${hostname}
    // # port: ${port}
    const hostname = lines
      .filter((line) => line.search(/# hostname: (.+)/) !== -1)
      .map((line) => line.split(":").pop().trim());

    const port = lines
      .filter((line) => line.search(/# port: (\d+)/) !== -1)
      .map((line) => parseInt(line.split(":").pop().trim()));

    configs.push({ hostname: hostname, upstream: "http://localhost:" + port });
  }

  return health(configs);
};

export default list;
