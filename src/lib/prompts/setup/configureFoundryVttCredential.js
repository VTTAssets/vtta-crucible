import inquirer from "inquirer";
import ui from "../../ui.js";
import Foundry from "../../../foundryvtt.com/index.js";

export const validate = async (credential) => {
  try {
    const account = await Foundry.authenticate(
      credential.username,
      credential.password
    );
    return account ? true : false;
  } catch (error) {
    return false;
  }
};

const configureFoundryVTTCredential = (credential) => {
  ui.h2("Foundry VTT: Username and Password");
  ui.log(
    `In order to retrieve your purchased licenses and the desired Foundry VTT version from https://foundryvtt.com, you need to supply your username and your password.`
  );

  return new Promise((resolve, reject) => {
    inquirer
      .prompt([
        {
          type: "string",
          message: "Enter your Username",
          name: "username",
        },
        {
          type: "password",
          message: "Enter your Password",
          name: "password",
        },
      ])
      .then((answers) => {
        resolve(Object.assign(credential, answers));
      });
  });
};

export default configureFoundryVTTCredential;
