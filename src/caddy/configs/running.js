const createConfig = (hostname, port, pm2Id) => {
  const logId = "accessLog" + pmsId;

  const baseConfig = {
    apps: {
      http: {
        servers: {},
      },
    },
    logging: {
      logs: {},
    },
  };

  const serverConfig = {
    listen: [":443"],
    routes: [
      {
        handle: [
          {
            handler: "subroute",
            routes: [
              {
                handle: [
                  {
                    handler: "request_body",
                    max_size: 100000000,
                  },
                  {
                    handler: "reverse_proxy",
                    health_checks: {
                      active: {
                        expect_status: 200,
                        interval: 2000000000,
                        timeout: 10000000000,
                        uri: "/icons/vtt.png",
                      },
                    },
                    upstreams: [
                      {
                        dial: "localhost:" + port,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        match: [
          {
            host: [hostname],
          },
        ],
        terminal: true,
      },
    ],

    logs: {
      logger_names: {
        "saloon.oneshot-tavern.com": logId,
      },
    },
  };

  // Set the server config
  baseConfig.apps.http.servers[hostname] = serverConfig;

  const logConfig = {
    include: ["http.log.access." + logId],
    writer: {
      filename: "/var/log/caddy/" + hostname + "-access.log",
      output: "file",
    },
  };

  // set log config
  baseConfig.logging.logs[logId] = logConfig;

  return baseConfig;
};
