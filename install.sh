#!/bin/bash

# Add additional sources to install node.js and caddy
echo -ne "Running pre-Install routine for node.js...";
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - > /dev/null 2>&1
echo "Done."

echo "Running pre-install for Caddy (reverse proxy)..."
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | tee /etc/apt/trusted.gpg.d/caddy-stable.asc > /dev/null 2>&1
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list > /dev/null 2>&1
echo "Done."

# Update the package list
echo -ne "Updating package list..."
apt update > /dev/null 2>&1 && apt upgrade -y > /dev/null 2>&1
echo "Done."

# Install pre-requisites
echo -ne "Installing software pre-requisites...";
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https > /dev/null 2>&1
echo "Done."

# Install nodejs.
echo -ne "Installing node.js..."
apt-get install -y nodejs yarn git > /dev/null 2>&1
echo "Done."

# Installing Caddy, an easy to use reverse proxy.
# We are employing Caddy to 
# a) manage our SSL certificates for us
# b) route traffic from our players to our installed Foundry VTT servers
echo -ne "Installing Caddy (reverse proxy)..."
apt-get install -y caddy > /dev/null 2>&1
echo "Done."

# Create a subdirectory to store a Caddyfile per FVTT server
mkdir -p /etc/caddy/crucible
# Add a reference to all config files stored in this directory to the main Caddyfile
grep -qxF 'import /etc/caddy/crucible/*' /etc/caddy/Caddyfile || echo 'import /etc/caddy/crucible/*' >>  /etc/caddy/Caddyfile

# Install the process manager for node.js processes 
echo -ne "Installing pm2 (node process manager)..."
npm install pm2@latest -g > /dev/null 2>&1
echo -ne "Done."

# Install a log rotate module to not fill up our drive with logs
echo -ne "Installing pm2 logrotate plugin, to avoid filling up our drive with logs..."
pm2 install pm2-logrotate > /dev/null 2>&1
echo "Done."

echo -ne "Registering pm2 as a service to be started automatically on boot..."
pm2 startup > /dev/null 2>&1
echo "Done."

echo "------------------------------------------"

echo "Installing crucible..."
git clone https://github.com/VTTAssets/vtta-crucible.git 2>&1 && cd vtta-crucible && npm install 2>&1
chmod +x src/cli.js 2>&1
npm link

echo "Done."