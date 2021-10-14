import DO from "../../../digitalocean/index.js";
import ui from "../../ui.js";
import inquirer from "inquirer";

const selectDomain = (domains) => {
  return new Promise(async (resolve, reject) => {
    const question = {
      type: "list",
      name: "domain",
      message: "Which domain do you want to use? ",
      choices: domains,
    };
    // query all necessary information
    inquirer
      .prompt([question])
      .then((answers) => {
        resolve(answers.domain);
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });
};

const getDomainConfiguration = async (environment) => {
  const requiresSetup = environment.meta.digitalOcean.domain.name === undefined;

  if (requiresSetup) {
    ui.h1("Choosing a domain");
    ui.log(
      `Select a domain to use for your Foundry VTT servers. Each server will get a subdomain assigned to it later on.`
    );
    // getting the meta info from DO: Domains
    const domains = await DO.domains.list(
      environment.credentials.digitalOcean.personalAccessToken
    );

    if (domains.length === 0) {
      ui.log(`You have no domains registered at Digital Ocean. Please go to a domain registrar, purchase a domain and register it within Digital Ocean. Registars are e.g.

      https://www.namecheap.com
      https://domains.google.com
      https://godaddy.com

  For information about adding a domain to Digital Ocean refer to the following documentation:

      https://docs.digitalocean.com/products/networking/dns/how-to/add-domains/
      
  Re-run the utility after registering a domain.`);
      process.exit(1);
    }

    // Select a domain
    const selectedDomain = await selectDomain(
      domains.map((domain) => domain.name)
    );
    environment.meta.digitalOcean.domain = {
      name: selectedDomain,
    };
  }

  // Updating the subdomain for the selected domain
  const domainRecords = await DO.domains.getRecords(
    environment.credentials.digitalOcean.personalAccessToken,
    selectedDomain
  );

  environment.meta.digitalOcean.domain.records = domainRecords
    .filter((r) => r.type === "A" || r.type === "CNAME")
    .map((r) => ({
      type: r.type,
      data: r.data,
      name: r.name,
    }));

  return environment.meta.digitalOcean.domain;
};

export default getDomainConfiguration;
