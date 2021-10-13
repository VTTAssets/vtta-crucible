import env from "../env.js";
import config from "../../config.js";
import ui from "../ui.js";

import configureDigitalOceanCredential, {
  validate as validateDigitalOceanCredential,
} from "./setup/configureDigitalOceanCredential.js";

import configureDigitalOceanSpaces, {
  validate as validateDigitalOceanSpaces,
} from "./setup/configureDigitalOceanSpaces.js";

import configureFoundryVttCredential, {
  validate as validateFoundryVttCredential,
} from "./setup/configureFoundryVttCredential.js";

import getDomainConfiguration from "./setup/getDomainConfiguration.js";
import getFoundryVttProfile from "./setup/getFoundryVttProfile.js";
import createFolders from "./setup/createFolders.js";
import getRuntimeInformation from "./setup/getRuntimeInformation.js";

// const setup = async () => {
//   const environment = await env.load();

//   ui.h1("Setup");
//   log(
//     `All configured settings will be stored in ${config.store.env}. File permissions are set restrictively, make sure that **nobody besides you can read this file**.`
//   );

//   // Digital Ocean Access Token
//   environment.credentials.digitalOcean = await configureDigitalOceanCredential(
//     environment.credentials.digitalOcean
//   );

//   inquirer.prompt([]);

//   // checking Digital Ocean credential status
//   if (
//     !env.isConfigured(environment.credentials.digitalOcean.personalAccessToken)
//   ) {
//     const credentials = await getDOCredential();
//     environment.credentials.digitalOcean.personalAccessToken =
//       credentials.personalAccessToken;
//   } else {
//     const account = await DO.authenticate(
//       environment.credentials.digitalOcean.personalAccessToken
//     );
//     if (account && account.status && account.status === "active") {
//       success(
//         `Authentication with Digital Ocean successful (${account.email})`
//       );
//     } else {
//       if (account.status && account.status !== "active") {
//         fail(
//           `Your Digital Ocean account is currently ${account.status}. An active account is required to continue.`
//         );
//         process.exit(1);
//       }
//     }
//   }

//   // getting the meta info from DO: Domains
//   const domains = await DO.domains.list(
//     environment.credentials.digitalOcean.personalAccessToken
//   );

//   for (let domain of domains) {
//     const records = await DO.domains.getRecords(
//       environment.credentials.digitalOcean.personalAccessToken,
//       domain
//     );
//     environment.meta.digitalOcean.domains.push({
//       name: domain,
//       records: records
//         .filter((r) => r.type === "A" || r.type === "CNAME")
//         .map((r) => ({
//           type: r.type,
//           data: r.data,
//           name: r.name,
//         })),
//     });
//   }

//   // getting the meta info from DO: Spaces
//   if (environment.credentials.digitalOceanSpaces.enabled) {
//     try {
//       const spaces = await DO.spaces.list(
//         environment.credentials.digitalOceanSpaces
//       );
//       success("Digital Ocean Spaces successfully configured");
//     } catch (error) {
//       fail(
//         "Digital Ocean Spaces is enabled, but I could not connect. Re-running configuration."
//       );
//       const spacesConfiguration = await promptSpacesConfiguration();
//       environment.credentials.digitalOceanSpaces.enabled =
//         spacesConfiguration.enabled;
//       if (environment.credentials.digitalOceanSpaces.enabled) {
//         environment.credentials.digitalOceanSpaces.name =
//           spacesConfiguration.name;
//         environment.credentials.digitalOceanSpaces.accessKeyId =
//           spacesConfiguration.accessKeyId;
//         environment.credentials.digitalOceanSpaces.secretAccessKey =
//           spacesConfiguration.secretAccessKey;
//         environment.credentials.digitalOceanSpaces.region =
//           spacesConfiguration.region;

//         success("Authentification with Digital Ocean Spaces succeeded");
//       } else {
//         success("Digital Ocean Spaces disabled");
//       }
//     }
//   }

//   // Foundry authentication configured?
//   if (
//     !env.isConfigured(
//       environment.credentials.foundryVtt.username,
//       environment.credentials.foundryVtt.password
//     )
//   ) {
//     warn("Credentials for Foundry VTT not yet configured");
//     const credentials = await getFVTTCredentials();
//     environment.credentials.foundryVtt.username = credentials.username;
//     environment.credentials.foundryVtt.password = credentials.password;

//     // storing the environment
//     await env.save(environment);
//   } else {
//     const authenticationResult = await Foundry.authenticate(
//       environment.credentials.foundryVtt
//     );

//     if (authenticationResult === 0) {
//       success(
//         `Authentification with Foundry VTT succeeded: (${environment.credentials.foundryVtt.username})`
//       );
//     } else {
//       // clearing the misconfigured user data and prompt the user to re-run the script
//       environment.credentials.foundryVtt.username = "";
//       environment.credentials.foundryVtt.password = "";
//       await env.save(environment);
//       fail(
//         "Authentication with Foundry VTT failed. Please re-run this script to reset your credentials."
//       );
//       process.exit(1);
//     }
//   }

//   // ----------------------------------------------------------

//   // updating the profile
//   const profile = await loadProfile(
//     environment.credentials.foundryVtt.username
//   );
//   environment.releases = profile.releases ? profile.releases : [];
//   environment.licenses = profile.licenses ? profile.licenses : [];

//   // FVTT health check
//   if (environment.licenses.length === 0) {
//     error(
//       "No Foundry VTT licenses found for your account. Purchase a license and re-run this script afterwards to continue."
//     );
//     process.exit(2);
//   }
//   // storing the environment
//   await env.save(environment);
//   success(
//     `Retrieved ${profile.licenses.length} license(s() and information about ${profile.releases.length} release(s) from https://foundryvtt.com.`
//   );

//   // ----------------------------------------------------------

//   // comparing the pm2 process list with the servers we have configured hered
//   const runningServers = await Server.runtime.list();

//   // ----------------------------------------------------------

//   //   await downloadRelease(
//   //     profile.releases.find((release) => release.build === 224)
//   //   );
//   return environment;
// };

const setup = async () => {
  const environment = await env.load();

  ui.h1("Initializing...");

  await createFolders();

  /**
   * Digital Oceaon credentials
   */
  let result = false;

  do {
    result = await validateDigitalOceanCredential(
      environment.credentials.digitalOcean.personalAccessToken
    );
    if (result) {
      ui.log("Digital Ocean credentials valid.", "success");
    } else {
      ui.log(
        "Digital Ocean credentials invalid, starting configuration.",
        "warn"
      );
      environment.credentials.digitalOcean =
        await configureDigitalOceanCredential(
          environment.credentials.digitalOcean
        );
    }
  } while (result === false);

  /**
   * Digital Oceaon Spaces credentials
   */
  result = false;
  do {
    result = await validateDigitalOceanSpaces(
      environment.credentials.digitalOceanSpaces
    );

    if (result) {
      ui.log("Digital Ocean Spaces credentials valid.", "success");
    } else {
      ui.log(
        "Digital Ocean Spaces credentials invalid, starting configuration.",
        "warn"
      );

      let spacesConfiguration = await configureDigitalOceanSpaces(
        environment.credentials.digitalOceanSpaces
      );
      if (spacesConfiguration === null) {
        ui.log("Digital Ocean Spaces will not be configured.", "success");
        spacesConfiguration = {
          name: "",
          accessKeyId: "",
          secretAccessKey: "",
          region: "",
        };
        // The user does not want to use Spaces
        result = true;
      }
      environment.credentials.digitalOceanSpaces = spacesConfiguration;
    }
  } while (result === false);

  /**
   * Foundry VTT credentials
   */
  do {
    result = await validateFoundryVttCredential(
      environment.credentials.foundryVtt
    );
    if (result) {
      ui.log("Foundry VTT credentials valid.", "success");
    } else {
      environment.credentials.foundryVtt = await configureFoundryVttCredential(
        environment.credentials.foundryVtt
      );
    }
  } while (result === false);

  /**
   * Saving the current environment for futher processing
   */
  await env.save(environment);

  /**
   * Digital Ocean: Registered Domains
   */
  let domainConfiguration = await getDomainConfiguration(environment);
  environment.meta.digitalOcean.domains = domainConfiguration;
  ui.log(
    `Retrieved information about ${domainConfiguration.length} domain${
      domainConfiguration.length > 1 ? "s" : ""
    }.`,
    "success"
  );

  /**
   * Foundry VTT: Releases and Licenses
   */
  let foundryVttProfile = await getFoundryVttProfile(environment);
  ui.log("Foundry VTT license and release information updated.", "success");
  environment.meta.foundryVtt = foundryVttProfile;

  /**
   * Get information about currently running servers
   */
  const runtimeInfo = await getRuntimeInformation();
  for (let server of runtimeInfo) {
    // display some little info tidbits for this server
    ui.log(
      `${server.hostname}: ${server.status} => ${
        server.upstream
      }. Health status: ${server.healthy ? "Good" : "Not Good"})`,
      server.healthy ? "success" : "warn"
    );
  }

  /**
   * Done with Setup, the script can now successfully start
   */
  await env.save(environment);
};

export default setup;
