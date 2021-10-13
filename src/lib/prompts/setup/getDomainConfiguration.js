import DO from "../../../digitalocean/index.js";
import ui from "../../ui.js";

const getDomainConfiguration = async (environment) => {
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

  for (let domain of domains) {
    const records = await DO.domains.getRecords(
      environment.credentials.digitalOcean.personalAccessToken,
      domain
    );
    environment.meta.digitalOcean.domains.push({
      name: domain,
      records: records
        .filter((r) => r.type === "A" || r.type === "CNAME")
        .map((r) => ({
          type: r.type,
          data: r.data,
          name: r.name,
        })),
    });
  }

  return domains;
};

export default getDomainConfiguration;
