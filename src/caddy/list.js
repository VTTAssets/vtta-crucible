import config from "../config.js";
import env from "../lib/env.js";

import api from "./api.js";

const API_PORT = 2019;

/**
 * Retrieves Health information for upstream reverse_proxies from Caddy
 * Maps it to previously retrieved basic details
 */
const getUpstreams = async () => {
  const upstreams = await api.get("/reverse_proxy/upstreams");
  return upstreams;
};

const parseConfig = (config) => {
  let port = null;
  try {
    port = parseInt(config.listen[0].substring(1));
  } catch (error) {
    port = null;
  }
  let upstream = null;
  try {
    const reverseProxy = config.routes[0].handle[0].routes[0].handle.find(
      (entry) => entry.handler === "reverse_proxy"
    );

    if (reverseProxy) {
      upstream = reverseProxy.upstreams[0].dial;
    }
  } catch (error) {
    upstream = null;
  }

  return { upstream, port };
};
/**
 * Retrieves a list of configured reverse_proxies
 */
const list = async () => {
  // get all configured servers
  const environment = env.load();

  const upstreamStatuses = await getUpstreams();

  return await Promise.all(
    environment.servers.map(async (server) => {
      const result = {
        hostname: server.hostname,
        configured: false,
        upstream: null,
        healthy: null,
      };

      const config = await api.get(
        "/config/apps/http/servers/" + server.hostname,
        "json"
      );

      // if config was not received
      if (!config) return server;

      const configuredProxy = parseConfig(config);

      if (configuredProxy.upstream) {
        // [
        //   {
        //     address: "localhost:30001",
        //     healthy: true,
        //     num_requests: 0,
        //     fails: 0,
        //   },
        // ];
        const upstreamStatus = upstreamStatuses.find(
          (entry) => entry.address === configuredProxy.upstream
        );
        result.upstream = configuredProxy.upstream;
        result.healthy = upstreamStatus.healthy;
        result.configured = result.upstream && result.healthy !== undefined;
      }

      return result;
    })
  );
};

export default list;
