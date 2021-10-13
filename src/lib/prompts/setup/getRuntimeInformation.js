import Caddy from "../../../caddy/index.js";
import inquirer from "inquirer";
import pm2 from "../../../pm2/index.js";

import ui from "../../ui.js";

const getRuntimeInformation = async () => {
  let caddyInfo = await Caddy.list();

  //   [
  //     {
  //       upstream: "localhost:30000",
  //       hostname: "saloon.oneshot-tavern.com",
  //       address: "localhost:30000",
  //       healthy: true,
  //       num_requests: 1,
  //       fails: 0,
  //     },
  //   ];

  const processInfo = await pm2.list();

  // [
  //   {
  //     hostname: "saloon.oneshot-tavern.com",
  //     id: 0,
  //     status: "online",
  //     resources: { memory: 80, cpu: 0.7 },
  //   },
  // ];

  // the caddy info is the most reliable one, since pm2 can be used to start
  // other processed, too, and the caddy list is filtered by
  // automatically created Caddyfiles

  // check for all caddie configs to be actually running, and disable any that aren't

  let runtimeInfo = [];
  for (let caddyConfig of caddyInfo) {
    // get the related process
    const proc = processInfo.find(
      (proc) => proc.hostname === caddyConfig.hostname
    );

    if (proc === undefined) {
      ui.log(
        `No process found for ${caddyConfig.hostname}, ignoring for this session.`,
        "error"
      );
    } else {
      runtimeInfo.push(Object.assign(caddyConfig, proc));
    }
  }
  return runtimeInfo;
};

export default getRuntimeInformation;
