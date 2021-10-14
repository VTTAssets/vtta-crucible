import express from "express";
import config from "../config.js";
const app = express();

import Servers from "../servers/index.js";

app.get("/health", async (req, res) => {
  const serverList = await Servers.list();
  res.json(serverList);
});

app.listen(config.www.port, () => {
  console.log("Listening on :" + config.www.port);
});
