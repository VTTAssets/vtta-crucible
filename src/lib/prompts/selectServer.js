import env from "../env.js";
import inquirer from "inquirer";

import Servers from "../../servers/index.js";

const selectServer = () => {
  return new Promise(async (resolve, reject) => {
    const servers = await Servers.list();

    console.log(servers);
    // query all necessary information
    inquirer
      .prompt([
        {
          type: "list",
          name: "server",
          message: "Select a server",
          choices: servers,
        },
      ])
      .then((answers) => {
        // If spaces is not configured, we set it to disabled to have a consistent UI later on

        resolve(answers.server);
      })
      .catch((error) => reject(error));
  });
};

export default selectServer;
