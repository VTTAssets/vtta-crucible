import Foundry from "../../../foundryvtt.com/index.js";
import ui from "../../ui.js";

const getFoundryVttProfile = async (environment) => {
  const profile = await Foundry.loadProfile(environment);

  // Input check
  if (profile.licenses.length == 0) {
    ui.log(
      "No purchased Foundry VTT licenses found in your account. Please purchase a license and re-run the script."
    );
    process.exit(2);
  }

  return profile;
};

export default getFoundryVttProfile;
