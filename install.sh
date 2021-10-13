#!/bin/bash

# Add additional sources to install node.js and caddy
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | tee /etc/apt/trusted.gpg.d/caddy-stable.asc
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list

# Update the package list
apt update && apt upgrade -y

# Install pre-requisites
apt-get install -y  debian-keyring debian-archive-keyring apt-transport-https &&  

# Install nodejs.
apt-get install -y nodejs yarn git

# Installing Caddy, an easy to use reverse proxy.
# We are employing Caddy to 
# a) manage our SSL certificates for us
# b) route traffic from our players to our installed Foundry VTT servers
apt-get install -y caddy

# Create a subdirectory to store a Caddyfile per FVTT server
mkdir /etc/caddy/sites-enabled
# Add a reference to all config files stored in this directory to the main Caddyfile
echo "import /etc/caddy/fvtt-servers/*" >> /etc/caddy/Caddyfile

# Install the process manager for node.js processes and a log-rotate utility to not fill up our drive
npm install pm2@latest -g
pm2 install pm2-logrotate