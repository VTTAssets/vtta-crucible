import config from "../config.js";
import { CookieJar } from "tough-cookie";
import { FileCookieStore as CookieFileStore } from "tough-cookie-file-store";
import cheerio from "cheerio";
import createLogger from "../lib/logging.js";
import fetchCookie from "fetch-cookie/node-fetch.js";
import nodeFetch from "node-fetch";

import { preflight } from "./authenticate.js";

// Scoped objects
let cookieJar;
let fetch;
let logger;

// Constants
const BASE_URL = "https://foundryvtt.com";
const LOCAL_DOMAIN = "vtta.io";
const LOGIN_URL = BASE_URL + "/auth/login/";
const USERNAME_RE = /\/community\/(?<username>.+)/;

const HEADERS = {
  DNT: "1",
  Referer: BASE_URL,
  "Upgrade-Insecure-Requests": "1",
  "User-Agent": "Mozilla/5.0",
};

const fetchProfile = async (username) => {
  const PROFILE_URL = `${BASE_URL}/community/${username}/licenses`;
  const response = await fetch(PROFILE_URL, {
    method: "GET",
    headers: HEADERS,
  });
  if (!response.ok) {
    throw new Error(`Unexpected response ${response.statusText}`);
  }
  const body = await response.text();
  const $ = await cheerio.load(body);

  // get all available releases
  let releases = [];
  $("select[name='build'] option").each((_, opt) => {
    const release = {
      build: parseInt($(opt).val()),
      name: $(opt).text().trim(),
      label: $(opt).parent("optgroup").attr("label"),
    };
    if (
      releases.find((existing) => existing.build === release.build) ===
      undefined
    )
      releases.push(release);
  });
  releases = releases.sort((a, b) => (a.build < b.build ? 1 : -1));

  // get all purchased licenses
  const licenses = $("pre.license-key code")
    .map(function () {
      return $(this).text().trim(); // do not remove dashes
    })
    .toArray();

  return { licenses, releases };
};

const loadProfile = async (environment) => {
  await preflight();
  cookieJar = new CookieJar(new CookieFileStore(config.store.cookies));
  fetch = fetchCookie(nodeFetch, cookieJar);

  // // Retrieve username from cookie.
  // const local_cookies = cookieJar.getCookiesSync(`http://${LOCAL_DOMAIN}`);
  // if (local_cookies.length != 1) {
  //   logger.error(
  //     `Wrong number of cookies found for ${LOCAL_DOMAIN}.  Expected 1, found ${local_cookies.length}`
  //   );
  //   return -1;
  // }
  // const loggedInUsername = local_cookies[0].value;

  const profile = await fetchProfile(
    environment.credentials.foundryVtt.username
  );

  return profile;
};

export default loadProfile;
