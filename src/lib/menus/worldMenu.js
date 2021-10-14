import mainMenu from "./mainMenu.js";

const LABEL = "World Menu";
const VALUE = "WORLD_MENU";

const worldMenu = {
  name: LABEL,
  value: VALUE,
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
    mainMenu.reference,
  ],
  reference: {
    name: `=> Go back to ${LABEL}`,
    value: VALUE,
  },
};

export default worldMenu;
