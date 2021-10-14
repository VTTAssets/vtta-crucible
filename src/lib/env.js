import config from "../config.js";
import createLogger from "../lib/logging.js";
import { readFileSync, writeFileSync } from "fs";

const DEFAULT = {
  servers: [],
  credentials: {
    foundryVtt: {
      label: "Foundry VTT (foundryvtt.com)",
      username: "",
      password: "",
    },
    digitalOcean: {
      label: "Digital Ocean (digitalocean.com)",
      personalAccessToken: "",
    },
    digitalOceanSpaces: {
      enabled: true,
      label: "Digital Ocean Spaces (digitalocean.com/products/spaces)",
      name: "",
      accessKeyId: "",
      secretAccessKey: "",
      region: "",
    },
  },
  meta: {
    foundryVtt: {
      releases: [],
      licenses: [],
    },
    digitalOcean: {
      domain: {},
    },
  },
};

/**
 * Loading the environment, or creating it if necessary
 */
const load = () => {
  const logger = createLogger("Environment", config.logging.level);
  try {
    let env = JSON.parse(readFileSync(config.store.env, { encoding: "utf-8" }));
    logger.info(`Environment loaded`);
    return env;
  } catch (error) {
    logger.warn("Environment loading failed, providing default environment");
    return DEFAULT;
  }
};

/**
 * Saves changed environment to the store
 * @param {object} env Environment to store
 * @returns
 */
const save = (env) => {
  const logger = createLogger("Environment", config.logging.level);
  try {
    writeFileSync(config.store.env, JSON.stringify(env, null, 3), {
      encoding: "utf-8",
      mode: 0o600,
    });
    logger.info(`Environment saved`);
    return env;
  } catch (error) {
    logger.warn("Environment save failed");
    throw error;
    return null;
  }
};

const isConfigured = (...properties) => {
  return (
    properties.filter(
      (property) =>
        property && typeof property === "string" && property.length > 0
    ).length === properties.length
  );
};

export default { load, save, isConfigured };
