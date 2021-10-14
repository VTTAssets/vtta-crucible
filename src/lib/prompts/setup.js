import env from "../env.js";
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

import Servers from "../../servers/index.js";

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
      await env.save(environment);
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
      await env.save(environment);
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
      await env.save(environment);
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
  environment.meta.digitalOcean.domain = domainConfiguration;
  ui.log(
    `Using ${domainConfiguration.name} as domain, found ${
      domainConfiguration.records.length
    } subdomain${
      domainConfiguration.records.length > 1 ? "s" : ""
    } already configured.`,
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
  await Servers.displayOverview();

  /**
   * Done with Setup, the script can now successfully start
   */
  await env.save(environment);
};

export default setup;
