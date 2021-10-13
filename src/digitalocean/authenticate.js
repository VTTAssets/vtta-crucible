import DOWrapper from "do-wrapper";
const DigitalOcean = DOWrapper.default;

const authenticate = (personalAccessToken) => {
  return new Promise((resolve, reject) => {
    const instance = new DigitalOcean(personalAccessToken);
    instance.account
      .get()
      .then((data) => {
        // resolving with account information
        resolve(data.account);
      })
      .catch((err) => reject(err));
  });
};

export default authenticate;
