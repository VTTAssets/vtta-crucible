import env from "../env.js";
import inquirer from "inquirer";
import DO from "../../digitalocean/index.js";

import ui from "../ui.js";

const serverConfiguration = () => {
  return new Promise(async (resolve, reject) => {
    // loading the current environment
    const environment = await env.load();

    // get all unassigned licenses
    const licenses = environment.meta.foundryVtt.licenses.map((license) => {
      const assignedServer = environment.servers.find(
        (server) => server.assignedLicense === license
      );
      return {
        key: license,
        assignedTo: assignedServer ? assignedServer.name : "<not assigned>",
      };
    });

    // get all domains registered Domains at DO
    const domains = environment.meta.digitalOcean.domains;

    ui.h1("Creating a new Foundry VTT Server");
    ui.log(
      `In order to create a new server, you will need to **decide on several configuration options**. Some are related to **how the server will be accessed** later on, others will provide additional configuration as **which license to use** and if you want to **enable a (previously configured) Spaces storage**.`
    );
    ui.h2("Pre-requisites");
    ui.log(`1) You have registed at least one domain to Digital Ocean
2) [optional: If you want to use Digital Ocean Spaces with this server] Digital Ocean spaces is enabled and configured`);

    ui.separator(20);

    ui.h2("Configuration");

    // query all necessary information
    inquirer
      .prompt([
        {
          type: "list",
          name: "domainName",
          message:
            "Select a domain which will be used. A subdomain name will be specified in the next step",
          choices: domains,
        },
        {
          type: "string",
          name: "subdomainName",
          message: "Enter a subdomain",
          transformer: (input, answers, option) => {
            return `${input}.${answers.domainName}`;
          },
          validate: async (input, answers) => {
            const validName = DO.domains.isValidDomainName(
              `${input}.${answers.domainName}`
            );
            if (!validName)
              return "Not a valid domain name. Please use only alphanumeric characters and hypens";
            // check if name is already in use

            const records = await DO.domains.getRecords(
              environment.credentials.digitalOcean.personalAccessToken,
              answers.domainName
            );
            const existingPointer = records.find(
              (record) => record.name === input
            );
            if (existingPointer) {
              return `${input}.${answers.domainName} is already configured for ${existingPointer.data}`;
            }
            // all good
            return true;
          },
        },
        {
          type: "list",
          name: "release",
          message: "Which Foundry version should the server run initially?",
          choices: environment.meta.foundryVtt.releases.map((release) => ({
            name: `${release.name} (${release.label})`,
            value: release.build,
          })),
        },
        {
          type: "list",
          name: "licenseKey",
          message:
            "Which license do you want to use for this server (only displaying unused licenses)?",
          choices: licenses.map((license) => ({
            name: `${license.key} (${license.assignedTo})`,
            value: license.key,
          })),
        },
        {
          type: "confirm",
          name: "spacesEnabled",
          when: DO.spaces.isSpacesConfigured(
            environment.credentials.digitalOceanSpaces
          ),
          message:
            "You have Digital Ocean Spaces configured. Enable it for this server?",
          default: true,
        },
      ])
      .then((answers) => {
        // If spaces is not configured, we set it to disabled to have a consistent UI later on
        answers.spacesEnabled =
          answers.spacesEnabled === undefined ? false : answers.spacesEnabled;

        console.log(answers);
        resolve(answers);
      })
      .catch((error) => reject(error));
  });
};

export default serverConfiguration;
