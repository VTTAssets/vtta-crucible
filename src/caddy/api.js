import fetch from "node-fetch";
import ui from "../lib/ui.js";

const api = {
  post: async (endpoint, data) => {
    const request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    console.log("CADDY API POST to " + `http://localhost:2019/${endpoint}`);
    console.log(request);

    try {
      const response = await fetch(
        `http://localhost:2019/${endpoint}`,
        request
      );

      if (response.ok) {
        console.log("Response is okay");

        let json = await response.json();
        console.log(json);
        console.log("---");
        return true;
      }
    } catch (error) {
      ui.log("Could not create Caddy reverse proxy configuration", "error");
      console.log(error);
      return false;
    }
  },
  get: async (endpoint, format = "json") => {
    const request = {
      method: "GET",
    };
    const response = await fetch(`http://localhost:2019/${endpoint}`, request);
    if (response.ok) {
      switch (format) {
        case "text":
          return response.text();
        default:
          return response.json();
      }
    }
    return false;
  },
};

export default api;
