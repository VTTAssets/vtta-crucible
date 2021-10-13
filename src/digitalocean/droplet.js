import fetch from "node-fetch";

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

export default {
  getIPAddress,
  getRegion,
};
