import AWS from "aws-sdk";
import droplet from "./droplet.js";
import env from "../lib/env.js";

/**
 * Date: 2021/10/13
 * List of regions providing Digital Ocean Spaces
 */
const SPACES_AVAILABILITY_MATRIX = ["nyc3", "sfo3", "ams3", "sgp1", "fra1"];

/**
 * Tries to provide the geographically nearest location to the
 * droplet. No fancy algo, but... *shrug*
 * @returns {string} a Digital Ocean region
 */
const getRecommendedSpacesRegion = async () => {
  const dropletRegion = await droplet.getRegion();
  switch (dropletRegion.toLowerCase()) {
    case "nyc1":
    case "nyc2":
    case "nyc3":
    case "tor1":
      return "nyc3";
    case "ams1":
    case "ams2":
    case "ams3":
      return "ams3";
    case "fra1":
    case "fra2":
    case "fra3":
      return "fra1";
    case "sfo1":
    case "sfo2":
    case "sfo3":
      return "sfo3";
    case "sgp1":
    case "blr1":
      return "sgp1";
    default:
      "nyc3";
  }
};

/**
 *
 * @returns {boolean} true, if the droplet's region
 */
const isSameRegionAsDroplet = async () => {
  const dropletRegion = await droplet.getRegion();
  return SPACES_AVAILABILITY_MATRIX.includes(dropletRegion.toUpperCase());
};

const isSpacesConfigured = (credentials) => {
  return !(
    credentials.accessKeyId === "" &&
    credentials.secretAccessKey === "" &&
    credentials.region === "" &&
    credentials.name === ""
  );
};

const list = (credentials) => {
  return new Promise((resolve, reject) => {
    let endpoint;
    if (!env.isConfigured(credentials.region))
      throw new Error("Spaces configuration incomplete");
    try {
      endpoint = new AWS.Endpoint(
        credentials.region + ".digitaloceanspaces.com"
      );
    } catch (error) {
      reject(new Error("Error creating the Digital Ocean Spaces Endpoint"));
    }

    try {
      const s3 = new AWS.S3({
        endpoint,
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      });

      s3.listBuckets({}, (err, data) => {
        if (err) {
          return reject(err);
        }
        if (data.Buckets)
          resolve(data["Buckets"].map((bucket) => bucket["Name"]));
        else resolve([]);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  list,
  isSameRegionAsDroplet,
  getRecommendedSpacesRegion,
  SPACES_AVAILABILITY_MATRIX,
  isSpacesConfigured,
};
