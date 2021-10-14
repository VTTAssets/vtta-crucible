import fetch from "node-fetch";
import { totalmem } from "os";

const requestMetaData = (slug) => {
  return new Promise((resolve, reject) => {
    fetch(`http://169.254.169.254/metadata/v1${slug}`)
      .then((response) => {
        if (response.ok) {
          return response.text();
        }
        throw response.statusText;
      })
      .then((text) => resolve(text))
      .catch((error) => reject(error));
  });
};

const getIPAddress = () => {
  return requestMetaData("/interfaces/public/0/ipv4/address");
};

const getRegion = async () => {
  return requestMetaData("/region");
};

const getRecommendedFoundryInstancesCount = () => {
  const total = Math.round(totalmem() / 1024 / 1024 / 1024);
  const reserved = 0.5;
  const requiredPerInstance = 0.25;

  return Math.floor((total - reserved) / requiredPerInstance);
};

export default {
  getIPAddress,
  getRegion,
  getRecommendedFoundryInstancesCount,
};
