import DOWrapper from "do-wrapper";
const DigitalOcean = DOWrapper.default;
import droplet from "./droplet.js";
import isValidDomain from "is-valid-domain";

const isValidDomainName = (str) => {
  return isValidDomain(str);
};

const list = async (personalAccessToken) => {
  const instance = new DigitalOcean(personalAccessToken);
  const domains = await instance.domains.getAll(null, true);
  return domains.map((domain) => domain.name);
};

// export interface DomainRecordRequestOptions {
//   type: string;
//   name: string;
//   data: string;
//   priority?: number;
//   port?: number;
//   ttl: number;
//   weight?: number;
//   flags?: number;
//   tag: string;
// }

const getRecords = async (personalAccessToken, domainName, instance = null) => {
  instance =
    instance === null ? new DigitalOcean(personalAccessToken) : instance;
  // check if that record already exists
  return instance.domains.getAllRecords(domainName, null, true);
};

const createRecord = async (personalAccessToken, domainName, subdomainName) => {
  const instance = new DigitalOcean(personalAccessToken);

  console.log(
    `createRecord(${personalAccessToken}, ${domainName}, ${subdomainName})`
  );
  const currentIp = await droplet.getIPAddress();
  console.log("Current IP: " + currentIp);

  let records;
  try {
    records = await getRecords(personalAccessToken, domainName, instance);
  } catch (error) {
    console.log("Error getting all records for Domain " + domainName);
    console.log(error);
    process.exit(1);
  }

  console.log("Configured records");
  console.log(records);

  // check if it exists already
  const existing = records.find((record) => record.name === subdomainName);
  if (existing) {
    if (existing.data !== currentIp) {
      // it's already set to this IP address
      throw Error(
        `Cannot create DNS record: ${subdomainName}.${domainName} is configured for ${existing.data} (current droplet IP: ${currentIp})`
      );
    }
  } else {
    try {
      await instance.domains.createRecord(domainName, {
        type: "A",
        name: subdomainName,
        data: currentIp,
        ttl: 3600,
      });
    } catch (error) {
      throw Error(
        `An error occured on creating the DNS record for ${subdomainName}.${domainName}: ${error.message}`
      );
    }
  }
  return currentIp;
};

export default { list, getRecords, createRecord, isValidDomainName };
