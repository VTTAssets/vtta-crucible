export default {
  logging: {
    level: "error",
  },
  store: {
    cookies: "/etc/crucible/cookies.json",
    env: "/etc/crucible/env.json",
    releases: "/var/crucible/releases",
    servers: "/var/crucible/servers",
    spacesConfig: "/var/crucible/servers/spacesConfig.json",
    caddyConfigs: "/etc/caddy/crucible",
  },
  www: {
    port: process.env.PORT || 3000,
  },
};
