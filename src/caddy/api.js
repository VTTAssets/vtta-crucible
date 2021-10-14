import fetch from "node-fetch";

const api = {
  post: async (endpoint, data) => {
    const request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(`http://localhost:2019/${endpoint}`, request);
    if (response.ok) {
      return true;
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
