import env from "../env.js";
import inquirer from "inquirer";

import Servers from "../../servers/index.js";
import CANCEL_PROMPT from "./index.js";

const selectServer = () => {
  return new Promise(async (resolve, reject) => {
    const servers = await Servers.list();

    console.log(servers);
    const question = {
      type: "list",
      name: "server",
      message: "Select a server",
      choices: [
        ...servers.map((server) => server.hostname),
        new inquirer.Separator(),
        CANCEL_PROMPT,
      ],
    };
    // query all necessary information
    inquirer
      .prompt([question])
      .then((answers) => {
        if (answers.server === CANCEL_PROMPT) reject(CANCEL_PROMPT);
        else resolve(answer.server);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

export default selectServer;
