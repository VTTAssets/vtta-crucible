import env from "../env.js";
import inquirer from "inquirer";

import Servers from "../../servers/index.js";

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
        "<Cancel>",
      ],
    };

    console.log("Question");
    console.log(question);

    // query all necessary information
    inquirer
      .prompt([])
      .then((answers) => {
        console.log("Answer received: ");
        console.log(answers);
        resolve(answers.server);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

export default selectServer;
