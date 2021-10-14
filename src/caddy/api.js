import fetch from "node-fetch";
import ui from "../lib/ui.js";

const api = {
  delete: async (endpoint) => {
    const request = {
      method: "DELETE",
    };

    try {
      const response = await fetch(
        `http://localhost:2019/${endpoint}`,
        request
      );

      return response.ok;
    } catch (error) {
      return false;
    }
  },
  post: async (endpoint, data) => {
    const request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    try {
      const response = await fetch(
        `http://localhost:2019/${endpoint}`,
        request
      );

      return response.ok;
    } catch (error) {
      return false;
    }
  },
  get: async (endpoint, format = "json") => {
    const request = {
      method: "GET",
    };
    console.log("API GET: " + `http://localhost:2019/${endpoint}`);
    console.log(request);
    const response = await fetch(`http://localhost:2019/${endpoint}`, request);
    console.log(response);
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
