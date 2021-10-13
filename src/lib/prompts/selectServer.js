import env from "../env.js";
import inquirer from "inquirer";

import Servers from "../../servers/index.js";

const selectServer = () => {
  return new Promise(async (resolve, reject) => {
    const servers = await Servers.list();
    servers.push({ name: "<Cancel>" });
    // query all necessary information
    inquirer
      .prompt([
        {
          type: "list",
          name: "server",
          message: "Select a server",
          choices: servers.map((server) => server.hostname),
        },
      ])
      .then((answers) => {
        resolve(answers.server);
      })
      .catch((error) => reject(error));
  });
};

export default selectServer;
