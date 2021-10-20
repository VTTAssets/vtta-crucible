#!/bin/bash

# Add additional sources to install node.js and caddy
echo "--- PRE-INSTALL: NODE.JS ----------------------------------------------"
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
echo "Done."
echo "-----------------------------------------------------------------------"

echo "--- PRE-INSTALL: Caddy ------------------------------------------------"
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | tee /etc/apt/trusted.gpg.d/caddy-stable.asc > /dev/null 2>&1
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list > /dev/null 2>&1
echo "Done."
echo "-----------------------------------------------------------------------"

# Update the package list
echo "--- INSTALLING: SYSTEM UPDATES ----------------------------------------"
echo -ne "Updating package list..."
apt update > /dev/null 2>&1
echo "Done."
echo "Installing system updates, this will take a couple of minutes. Please stand by..."
apt upgrade -y 
echo "Done."
echo "-----------------------------------------------------------------------"
# Install pre-requisites
echo "--- INSTALLING: SOFTWARE REQUIREMENTS ---------------------------------"
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https yarn git
echo "Done."
echo "-----------------------------------------------------------------------"

# Install nodejs.
echo "--- INSTALLING: NODE.JS -----------------------------------------------"
apt-get install -y nodejs 
echo "Done."
echo "-----------------------------------------------------------------------"

# Installing Caddy, an easy to use reverse proxy.
# We are employing Caddy to 
# a) manage our SSL certificates for us
# b) route traffic from our players to our installed Foundry VTT servers
echo "--- INSTALLING: CADDY -------------------------------------------------"
apt-get install -y caddy
# Disabling regular Caddyfile configuration, instead using...
sudo systemctl disable --now caddy 
# ... configuration via API
sudo systemctl enable --now caddy-api
echo "Done."
echo "-----------------------------------------------------------------------"

# Create a subdirectory to store a Caddyfile per FVTT server
# mkdir -p /etc/caddy/crucible
# Add a reference to all config files stored in this directory to the main Caddyfile
# grep -qxF 'import /etc/caddy/crucible/*' /etc/caddy/Caddyfile || echo 'import /etc/caddy/crucible/*' >>  /etc/caddy/Caddyfile

# Install the process manager for node.js processes 
echo "--- INSTALLING: PM2 ---------------------------------------------------"
npm install pm2@latest -g 
echo "Done."
echo "-----------------------------------------------------------------------"

# Install a log rotate module to not fill up our drive with logs
echo "--- INSTALLING: PM2 LOG ROTATION --------------------------------------"
pm2 install pm2-logrotate 
echo "Done."
echo "--- CONFIGURING: PM2 (STARTUP) ----------------------------------------"
pm2 startup 
echo "Done."
echo "-----------------------------------------------------------------------"


echo "Installing crucible..."
git clone https://github.com/VTTAssets/vtta-crucible.git 2>&1 && cd vtta-crucible && npm install 2>&1
chmod +x src/cli.js 2>&1
# npm link

echo "Done."