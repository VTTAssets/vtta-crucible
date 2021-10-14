import inquirer from "inquirer";
import Prompts from "./prompts/index.js";

import Server from "../servers/index.js";
import droplet from "../digitalocean/droplet.js";
import ui from "./ui.js";
import env from "./env.js";

const MENU_ITEM_BACK = (name, jumpLabel) => ({
  name: `=> Go back to ${name}`,
  value: jumpLabel,
});

const mainMenu = {
  name: "Main Menu",
  value: "MAIN_MENU",
  entries: [
    {
      name: "Manage your Foundry VTT servers",
      value: "SERVER_MENU",
    },
    {
      name: "Manage Worlds",
      value: "WORLD_MENU",
    },
    {
      name: "=> Exit program",
      value: "MENU_ITEM_EXIT",
      fn: async () => process.exit(0),
    },
  ],
};

const serverMenu = {
  name: "Server Menu",
  value: "SERVER_MENU",
  init: async () => {
    console.log("Rendering Server Menu");
    const servers = await Server.list();
    console.log(servers);

    ui.h2("Server Overview");
    const maxInstanceCount = droplet.getRecommendedFoundryInstancesCount();
    ui.log(
      `**${servers.length} servers configured: ${servers
        .map((server) => server.name)
        .join(",")}, maximum recommended Foundry Server count: 
        #${maxInstanceCount}`,
      maxInstanceCount < servers.length
        ? "success"
        : maxInstanceCount === servers.length
        ? "warn"
        : "error"
    );

    for (let server of servers) {
      ui.log(
        `${server.hostname} ==> | Proxy: ${server.proxy.upstream} (Health: ${
          server.proxy.healthy ? "Good" : "Not Good"
        }) | ==> | Process: #${server.process.id} (Status: ${
          server.process.status
        }, Ressources: ${
          server.process.ressources.memory
            ? server.process.ressources.memory
            : "(unknown)"
        }MB RAM / ${
          server.process.ressources.cpu
            ? server.process.ressources.cpu
            : "(unknown)"
        } CPU)`
      );
    }
  },
  entries: [
    {
      name: "Create new Foundry VTT server",
      value: "MENU_ITEM_CREATE_SERVER",
      fn: async () => {
        const configuration = await Prompts.serverConfiguration();
        // prepare everything for this new server
        await Server.create(configuration);
      },
    },
    {
      name: "Delete a Foundry VTT server",
      value: "MENU_ITEM_DELETE_SERVER",
      fn: async () => {
        try {
          const selectedServerHostname = await Prompts.selectServer();
          const environment = env.load();
          const server = environment.servers.find(
            (server) => server.hostname === selectedServerHostname
          );
          if (server) {
            ui.log("Server deletion requested: " + server.hostname);
            const confirmation = await Prompts.confirm(
              "Do you really want to delete the server? This action cannot be reversed!"
            );
            if (confirmation) await Server.destroy(server);
          }
        } catch (error) {
          ui.log("ERROR DELETING SERVER", "error");
          console.log(error);
          // Going back to the Manage menu
          // not doing anything here will re-render
        }
      },
    },
    {
      name: "(Re)start a Foundry VTT server",
      value: "MENU_ITEM_START_SERVER",
      fn: async () => {
        console.log("Called 'Start Server'");
      },
    },
    {
      name: "Stop a Foundry VTT server",
      value: "MENU_ITEM_SHUTDOWN_SERVER",
      fn: async () => {
        console.log("Called 'Shutdown Server'");
      },
    },
    MENU_ITEM_BACK("Main Menu", mainMenu.value),
  ],
};

const worldMenu = {
  name: "World Menu",
  value: "WORLD_MENU",
  entries: [
    {
      name: "Clone World",
      value: "MENU_ITEM_CLONE_WORLD",
      fn: async () => {
        console.log("Called 'Clone World'");
      },
    },
    {
      name: "Snapshot World",
      value: "MENU_ITEM_SNAPSHOT_WORLD",
      fn: async () => {
        console.log("Called 'Snapshot World'");
      },
    },
    {
      name: "Clone World from Snapshot",
      value: "MENU_ITEM_RESTORE_WORLD",
      fn: async () => {
        console.log("Called 'Restore World'");
      },
    },
    MENU_ITEM_BACK("Main Menu", mainMenu.value),
  ],
};

const MENUS = [mainMenu, serverMenu, worldMenu];

const displayMenu = (menu) => {
  return new Promise((resolve, reject) => {
    inquirer
      .prompt([
        {
          type: "list",
          name: "selection",
          message: "Please choose",
          choices: menu.entries,
        },
      ])
      .then((answer) => {
        resolve(menu.entries.find((entry) => entry.value === answer.selection));
      });
  });
};

const show = async () => {
  let currentMenu = mainMenu;
  let selection;
  let menuCount = 0;
  do {
    menuCount++;
    // some menus have a "header"
    if (currentMenu.init !== undefined) await currentMenu.init();
    const selection = await displayMenu(currentMenu);

    if (selection.fn === undefined) {
      // going to a menu, let's find it
      currentMenu = MENUS.find((menu) => menu.value === selection.value);
    } else {
      await selection.fn();
    }
  } while (!selection || selection.value !== "MENU_ITEM_EXIT");
};

//   .then((space) => {
//     answers.name = space.name;

//     // saving the configuration file now
//     const spacesConfiguration = {
//       accessKeyId: answers.accessKeyId,
//       secretAccessKey: answers.secretAccessKey,
//       region: `${answers.region}.digitaloceanspaces.com`,
//     };

//     writeFileSync(
//       config.store.spacesConfig,
//       JSON.stringify(spacesConfiguration, null, 3),
//       { encoding: "utf-8" }
//     );
//     success(
//       `Stored Spaces configuration to ${config.store.spacesConfig}`
//     );

//     resolve(answers);
//   });

export default {
  show,
};
