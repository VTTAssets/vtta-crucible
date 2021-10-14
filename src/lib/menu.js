// import inquirer from "inquirer";
// import Prompts from "./prompts/index.js";

// import Server from "../servers/index.js";
// import droplet from "../digitalocean/droplet.js";
// import ui from "./ui.js";
// import env from "./env.js";

// import { mainMenu, serverMenu, worldMenu } from "./menus/index.js";

// const MENUS = [mainMenu, serverMenu, worldMenu];

// const displayMenu = (menu) => {
//   return new Promise((resolve, reject) => {
//     inquirer
//       .prompt([
//         {
//           type: "list",
//           name: "selection",
//           message: "Please choose",
//           choices: menu.entries,
//         },
//       ])
//       .then((answer) => {
//         resolve(menu.entries.find((entry) => entry.value === answer.selection));
//       });
//   });
// };

// const show = async () => {
//   let currentMenu = mainMenu;
//   let selection;
//   let menuCount = 0;
//   do {
//     menuCount++;
//     // some menus have a "header"
//     if (currentMenu.init !== undefined) await currentMenu.init();
//     ui.separator(20);
//     const selection = await displayMenu(currentMenu);

//     if (selection.fn === undefined) {
//       // going to a menu, let's find it
//       currentMenu = MENUS.find((menu) => menu.value === selection.value);
//     } else {
//       await selection.fn();
//     }
//   } while (!selection || selection.value !== "MENU_ITEM_EXIT");
// };

// //   .then((space) => {
// //     answers.name = space.name;

// //     // saving the configuration file now
// //     const spacesConfiguration = {
// //       accessKeyId: answers.accessKeyId,
// //       secretAccessKey: answers.secretAccessKey,
// //       region: `${answers.region}.digitaloceanspaces.com`,
// //     };

// //     writeFileSync(
// //       config.store.spacesConfig,
// //       JSON.stringify(spacesConfiguration, null, 3),
// //       { encoding: "utf-8" }
// //     );
// //     success(
// //       `Stored Spaces configuration to ${config.store.spacesConfig}`
// //     );

// //     resolve(answers);
// //   });

// export default {
//   show,
// };
