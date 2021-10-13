import inquirer from "inquirer";
import ui from "../../ui.js";
import DO from "../../../digitalocean/index.js";

export const validate = async (personalAccessToken) => {
  try {
    const account = await DO.authenticate(personalAccessToken);
    return account ? true : false;
  } catch (error) {
    return false;
  }
};

const configureDigitalOceanCredential = (credential) => {
  ui.h2("Digital Ocean: Personal Access Token");
  ui.log(`During Foundry VTT server creation, you will define a domain name to be used to access the server. The installer will create the necessary DNS configuration at Digital Ocean for you, this requires a Digital Ocean Personal Access key with read and write permissions.
It is recommended to **create an personal access key used only for this utility**. You can do that by visiting your Digital Ocean Control Panel at
  
  **https://cloud.digitalocean.com/account/api/tokens**
  
The token needs **read (enabled per default) and write (disabled per default) permissions**.`);

  return new Promise((resolve, reject) => {
    inquirer
      .prompt([
        {
          type: "password",
          message: "Enter your Personal Access Token",
          name: "personalAccessToken",
          // validate: validate,
        },
      ])
      .then((answers) => {
        resolve(Object.assign(credential, answers));
      });
  });
};

export default configureDigitalOceanCredential;
