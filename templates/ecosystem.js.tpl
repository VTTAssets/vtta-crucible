module.exports = {
  apps : [{
    name: "{{DOMAIN}}",
    script: "resources/app/main.js",
    args: ["--dataPath={{CONFIG.store.servers}}/root/servers/{{DOMAIN}}/data", "--port={{PORT}}", "--hostname={{DOMAIN}}", "proxySSL=true", "proxyPort=443"],
    cwd: "{{CONFIG.store.servers}}/root/servers/{{DOMAIN}}/bin",
  }],
};