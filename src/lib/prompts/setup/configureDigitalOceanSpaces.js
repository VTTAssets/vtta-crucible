import inquirer from "inquirer";
import ui from "../../ui.js";
import DO from "../../../digitalocean/index.js";

export const validate = (credential) => {
  return new Promise((resolve, reject) => {
    DO.spaces
      .list(credential)
      .then((list) => resolve(true))
      .catch((error) => {
        resolve(false);
      });
  });
};

const confirmSpacesEnable = () => {
  return new Promise((resolve, reject) => {
    inquirer
      .prompt([
        {
          type: "confirm",
          message: "Do you want to enable Digital Ocean Spaces?",
          name: "enabled",
          default: false,
        },
      ])
      .then((answer) => resolve(answer.enabled));
  });
};

const getBasicConfiguration = async () => {
  const recommendedSpacesRegion = await DO.spaces.getRecommendedSpacesRegion();

  return new Promise((resolve, reject) => {
    inquirer
      .prompt([
        {
          type: "password",
          message: "Enter your Access Key",
          name: "accessKeyId",
        },
        {
          type: "password",
          message: "Enter your Secret Key",
          name: "secretAccessKey",
        },
        {
          type: "list",
          message: "Select a datacenter region to be used for Spaces",
          name: "region",
          choices: DO.spaces.SPACES_AVAILABILITY_MATRIX,
          default: recommendedSpacesRegion,
        },
      ])
      .then((answers) => {
        resolve(answers);
      });
  });
};

// Digital Ocean Spaces is an object storage compatible to Amazon AWS S3. Is uses a REST API to store and retrieve files and is seperate
// from the droplet you configure in a second. Spaces are not available in all regions, therefore it is the first question to answer.

// While having certain benefits, Spaces might not be of interest for all users, especially if you need to keep the costs low.

// Pros:
// - High impact: You have a shared storage that all your worlds can access, e.g. upload all battlemaps once and use it in all worlds
// - High impact: More space (250 GB vs ~25GB of the droplet, minus operating system space requirements)
// - Medium/low impact: You can enable CDN-hosting, pushing copies of your files accessed on your storage to locations near your players/ you. This can impact responsiveness positively.

// Cons:
// - High impact: It adds 5 USD per month on your bill
// - High/medium impact: Storage Spaces are only available in ${availableRegions
//     .map((region) => region.name)
//     .join(", ")}, limiting your region choices for your droplet
// `);

/**
 *
 * @param {object} credentials Spaces credentisl
 * @returns object | false
 */
const configureDigitalOceanSpaces = async (credentials) => {
  ui.h2("Digital Ocean Spaces: Usage and Access Key/Secret Key");
  ui.log(`Foundry VTT needs it's own pair of keys to access your Digital Ocean Spaces. This tool will use the same configuration for all server you choose to enable Spaces for. In order to generate the key pair, visit
  
  **https://cloud.digitalocean.com/account/api/tokens**
  
and scroll to the bottom of the page.`);

  const enableSpaces = await confirmSpacesEnable();
  if (!enableSpaces) {
    return null;
  }

  return new Promise(async (resolve, reject) => {
    const basicConfiguration = await getBasicConfiguration();

    let isValid = false;
    try {
      isValid = await validate(basicConfiguration);
    } catch (error) {
      isValid = false;
    }

    if (isValid) {
      ui.log("Authentification successful", "success");
      resolve(Object.assign(credentials, basicConfiguration));
    } else {
      ui.log(
        `Connection to Spaces with the provided credentials failed. Restarting...`,
        "error"
      );
      ui.separator(20);
      resolve(false);
    }
  });
};

export default configureDigitalOceanSpaces;
