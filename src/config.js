export default {
  logging: {
    level: "error",
  },
  store: {
    cookies: "config/cookies.json",
    env: "config/env.json",
    releases: "/var/fvtt/releases",
    servers: "/var/fvtt/servers",
    spacesConfig: "/var/fvtt/servers/spacesConfig.json",
    caddyConfigs: "/etc/caddy/fvtt",
  },
};
