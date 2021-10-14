const LABEL = "Main Menu";
const VALUE = "MAIN_MENU";

const exitTool = {
  name: "=> Exit program",
  value: "MENU_ITEM_EXIT",
  fn: async () => process.exit(0),
};

const mainMenu = {
  name: LABEL,
  value: VALUE,
  entries: [
    {
      name: "Manage your Foundry VTT servers",
      value: "SERVER_MENU",
    },
    {
      name: "Manage Worlds",
      value: "WORLD_MENU",
    },
    exitTool,
  ],
  reference: {
    name: `=> Go back to ${LABEL}`,
    value: VALUE,
  },
};

export default mainMenu;
