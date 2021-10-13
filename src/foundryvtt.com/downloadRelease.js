import config from "../config.js";
import { createWriteStream, fstat } from "fs";
import { CookieJar } from "tough-cookie";
import { FileCookieStore as CookieFileStore } from "tough-cookie-file-store";

import createLogger from "../lib/logging.js";
import fetchCookie from "fetch-cookie/node-fetch.js";
import nodeFetch from "node-fetch";
import mkdirp from "mkdirp";
import rimraf from "rimraf";
import chalk from "chalk";

import { renameSync, existsSync } from "fs";
import { resolve } from "path";
import { preflight } from "./authenticate.js";

import cliProgress from "cli-progress";

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

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// https://foundryvtt.s3.amazonaws.com/releases/0.8.9/foundryvtt-0.8.9.zip?AWSAccessKeyId=AKIA2KJE5YZ3EFLQJT6N&Signature=LrKD3r1Lat23wecp7HLTJJ8Uyz4%3D&Expires=1633870834
// https://foundryvtt.s3.amazonaws.com/releases/9.224/FoundryVTT-9.224.zip?AWSAccessKeyId=AKIA2KJE5YZ3EFLQJT6N&Signature=LV20iSDLruivK4Uug4WFNWUsAcQ%3D&Expires=1633870856
const downloadFile = async (label, url, path) => {
  const res = await fetch(url);

  const contentLength = res.headers.get("Content-Length");

  const formatter = (options, params, payload) => {
    const bar = `${chalk.green(
      options.barCompleteString
        .substr(0, Math.round(params.progress * options.barsize))
        .padEnd(options.barsize, " ")
    )}`;

    const pct = Math.ceil((params.value * 100) / params.total);
    return ` Downloading ${label} ${chalk.yellow(
      bar
    )} | ${pct}% | ${formatBytes(params.value)} / ${formatBytes(params.total)}`;
  };

  const downloadProgress = new cliProgress.SingleBar(
    {
      format: formatter,
    },

    cliProgress.Presets.shades_classic
  );

  downloadProgress.start(contentLength, 0);

  const fileStream = createWriteStream(path);
  let written = 0;
  return new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    res.body.on("data", (data) => {
      written += data.length;

      if (written >= contentLength) {
        resolve(path);
      }
      downloadProgress.update(written);
    });

    fileStream.on("end", resolve);
  });
};

const getReleaseUrl = async (release) => {
  logger.debug("Getting Release URL");
  const releaseUrl = `${BASE_URL}/releases/download?build=${release.build}&platform=linux`;

  const response = await fetch(releaseUrl, {
    method: "GET",
    headers: HEADERS,
    redirect: "manual",
  });

  // Expect a redirect status
  if (!(response.status >= 300 && response.status < 400)) {
    throw new Error(`Unexpected response ${response.statusText}`);
  }

  const s3RedirectUrl = response.headers.get("location");
  logger.debug(`S3 presigned URL: ${s3RedirectUrl}`);

  return s3RedirectUrl;
};

/**
 * Checks if a given release has already been downloaded
 * @param {object} release Release information
 * @returns {boolean} true, if it exists, false otherwise
 */
export const releaseExists = (release) => {
  const target = resolve(config.store.binaries, release.build + ".zip");
  return existsSync(target);
};

/**
 * Downloads a specific release into a temporary directory and moves it to the binary library
 * afterwards
 * @param {object} release Release information
 * @returns
 */
const downloadRelease = async (release) => {
  await preflight();
  logger = createLogger("Download", config.logging.level);

  logger.debug("Retrieving Cookie Jar");

  cookieJar = new CookieJar(new CookieFileStore(config.store.cookies));
  fetch = fetchCookie(nodeFetch, cookieJar);

  const url = await getReleaseUrl(release);

  // create a temp directory
  const targetPath = `/tmp`;
  rimraf.sync(targetPath);
  mkdirp.sync(targetPath);
  const releaseArchive = `${targetPath}/${release.build}.zip`;
  const temporaryFilename = await downloadFile(
    release.name,
    url,
    releaseArchive
  );
  const targetFilename = `${config.store.releases}/${release.build}.zip`;
  await renameSync(temporaryFilename, targetFilename);
  return targetFilename;
};

export default downloadRelease;
