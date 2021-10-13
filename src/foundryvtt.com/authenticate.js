import config from "../config.js";
import env from "../lib/env.js";

import { CookieJar, Cookie } from "tough-cookie";
import { FileCookieStore as CookieFileStore } from "tough-cookie-file-store";
import cheerio from "cheerio";
import createLogger from "../lib/logging.js";
import docopt from "docopt";
import fetchCookie from "fetch-cookie/node-fetch.js";
import nodeFetch from "node-fetch";

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

/**
 * fetchTokens - Fetch the CSRF form and cookie tokens.
 *
 * @return {string}  CSRF middleware token extracted from the login form.
 */
const fetchTokens = async () => {
  // Make a request to the main site to get our two CSRF tokens
  const response = await fetch(BASE_URL, {
    method: "GET",
    headers: HEADERS,
  });
  if (!response.ok) {
    throw new Error(`Unexpected response ${response.statusText}`);
  }
  const body = await response.text();
  const $ = await cheerio.load(body);

  const csrfmiddlewaretoken = $('input[name ="csrfmiddlewaretoken"]').val();
  if (typeof csrfmiddlewaretoken == "undefined") {
    throw new Error("Could not find the CSRF middleware token.");
  }
  return csrfmiddlewaretoken;
};

/**
 * login - Login to site, and get a session cookie, and actual username.
 *
 * @param  {string} csrfmiddlewaretoken CSRF middleware token extracted from form.
 * @param  {string} username            Username or e-mail address of user.
 * @param  {string} password            Password associated with the username.
 * @return {string}                     The actual username of the account.
 */
const login = async (csrfmiddlewaretoken, username, password) => {
  const form_params = new URLSearchParams({
    csrfmiddlewaretoken: csrfmiddlewaretoken,
    login_password: password,
    login_redirect: "/",
    login_username: username,
    login: "",
  });

  const response = await fetch(LOGIN_URL, {
    body: form_params,
    method: "POST",
    headers: HEADERS,
  });
  if (!response.ok) {
    throw new Error(`Unexpected response ${response.statusText}`);
  }
  const body = await response.text();
  const $ = await cheerio.load(body);

  // Check to see if we have a sessionid (logged in)
  const cookies = cookieJar.getCookiesSync(BASE_URL);
  const session_cookie = cookies.find((cookie) => {
    return cookie.key == "sessionid";
  });

  if (typeof session_cookie == "undefined") {
    throw new Error(
      `Unable to log in as ${username}, verify your credentials...`
    );
  }

  // A user may login with an e-mail address.  Resolve it to a username now.
  const communityURL = $("#login-welcome a").attr("href");
  const match = communityURL.match(USERNAME_RE);
  const loggedInUsername = match.groups.username;

  // The site preserves case, but this will break our use in the LICENSE_URL
  return loggedInUsername.toLowerCase();
};

const authenticate = async (username, password) => {
  cookieJar = new CookieJar(new CookieFileStore(config.store.cookies));
  fetch = fetchCookie(nodeFetch, cookieJar);

  try {
    // Get the tokens and cookies we'll need to login.
    const csrfmiddlewaretoken = await fetchTokens();

    // Login using the credentials, tokens, and cookies.
    const loggedInUsername = await login(
      csrfmiddlewaretoken,
      username,
      password
    );

    // Store the username in a cookie for use by other utilities
    const username_cookie = Cookie.parse(
      `username=${loggedInUsername}; Domain=${LOCAL_DOMAIN}; Path=/`
    );
    cookieJar.setCookieSync(username_cookie, `http://${LOCAL_DOMAIN}`);
    return true;
  } catch (err) {
    return false;
  }
  return 0;
};

/**
 * Updating csrf token and session id
 */
export const preflight = async () => {
  const environment = await env.load();
  if (
    environment.credentials.foundryVtt.username &&
    environment.credentials.foundryVtt.password
  ) {
    await authenticate(
      environment.credentials.foundryVtt.username,
      environment.credentials.foundryVtt.password
    );
  } else {
    throw new Error("Foundry credentials not set");
  }
};

export default authenticate;
