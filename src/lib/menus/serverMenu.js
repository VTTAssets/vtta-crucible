import Servers from "../../servers/index.js";
import mainMenu from "./mainMenu.js";

import Prompts from "../prompts/index.js";
import droplet from "../../digitalocean/droplet.js";
import ui from "../ui.js";
import env from "../env.js";

const LABEL = "Server Menu";
const VALUE = "SERVER_MENU";

const serverMenu = {
  name: LABEL,
  value: VALUE,
  init: async () => {
    const servers = await Servers.list();
    console.log(servers);

    ui.h2("Server Overview");
    const maxInstanceCount = droplet.getRecommendedFoundryInstancesCount();
    if (servers.length) {
      ui.log(`Servers configured: ${servers.length}/${maxInstanceCount} *`);
      ui.log(
        `* Maximum recommended Foundry Server count for this Droplet: ${maxInstanceCount}. This value is based on available memory.`,
        servers.length < maxInstanceCount
          ? "success"
          : servers.length === maxInstanceCount
          ? "warn"
          : "error"
      );
    } else {
      ui.log("Servers configured: None");
    }

    await Servers.displayOverview();
  },
  entries: [
    {
      name: "Create new Foundry VTT server",
      value: "MENU_ITEM_CREATE_SERVER",
      fn: async () => {
        const configuration = await Prompts.serverConfiguration();
        // prepare everything for this new server
        await Servers.create(configuration);
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
            if (confirmation) await Servers.destroy(server);
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
    mainMenu.reference,
  ],
  reference: {
    name: `=> Go back to ${LABEL}`,
    value: VALUE,
  },
};

export default serverMenu;
