import inquirer from "inquirer";
import ui from "../ui.js";
import mainMenu from "./mainMenu.js";
import serverMenu from "./serverMenu.js";
import worldMenu from "./worldMenu.js";

const MENUS = [mainMenu, serverMenu, worldMenu];

const displayMenu = (menu) => {
  // insert a seperator before the last menu.entries entry
  const entries = [...menu.entries];
  entries.pop();
  entries.push(new inquirer.Separator());
  entries.push(menu.entries[menu.entries.length - 1]);

  return new Promise((resolve, reject) => {
    inquirer
      .prompt([
        {
          type: "list",
          name: "selection",
          message: "Please choose",
          choices: entries,
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
    ui.separator(20);
    const selection = await displayMenu(currentMenu);

    if (selection.fn === undefined) {
      // going to a menu, let's find it
      currentMenu = MENUS.find((menu) => menu.value === selection.value);
    } else {
      await selection.fn();
    }
  } while (!selection || selection.value !== "MENU_ITEM_EXIT");
};

export default { show, mainMenu, serverMenu, worldMenu };
