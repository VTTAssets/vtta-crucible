import api from "./api.js";

const destroy = async (hostname) => {
  return api.delete("/config/apps/http/servers/" + hostname);
};

export default destroy;
