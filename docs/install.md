# Pre-installation

## Terms

- **Domain** - a human-rememberable name for an IP address. A _Domain Name Server_ (DNS) translates a domain like www.google.com into an IP address which is then used to communicate between two parties. You need to register a domain to your name in order to use it, this costs money (a couple of Dollars per year, depending on where you buy the domain and which suffix it as. `.com` domains are generally cheap and broadly available)
- **Domain Registrar** - someone that is allowed to sell you the usage rights on a domain name. Popular examples are NameCheap, Google Domains, GoDaddy and a myriad of others.
- **Domain Name Server** - does the actual translating of names into IP addresses. The domain registrar usually provides a web interface to add records like "my.domain.com is pointing to 141.32.92.18". As we will manage these records from within Digital Ocean, you will need to point to the Digital Ocean DNS server on the registrar administration panel. Digital Ocean has [instructions on how to do that](https://www.digitalocean.com/community/tutorials/how-to-point-to-digitalocean-nameservers-from-common-domain-registrars) for a wide number of registrars.
- **Access Tokens** - act as a credential that authorizes you to use certain services and take certain actions. We will use different tokens in the utility:

  - A Personal Access Token with read and write privileges to your Digital Ocean account is required to manage the DNS records for you
  - A pair of tokens (access and secret) is used to authorize your access to Digital Ocean Spaces, if you want to use that
  - A username and a password authenticates you with http://foundryvtt.com to get information about your purchased licenses and released Foundry VTT builds.
  - SSH public/private key pair is used to identify when logging to your Droplet. It's the one token that [you need to create by yourself](https://docs.digitalocean.com/products/accounts/security/#ssh-keys) and not create it on the Digital Ocean Control Panel

    Protect all these credentials! If you make them public, anyone can use them to successfully authorize themselves **as you** at Digital Ocean and Foundry VTT!

- **Droplet** - Digital Ocean's fancy name for a virtual machine
- **Spaces** - Digital Ocean's fancy name for an [Object Storage](spaces-benefits.md)
- **Region** - Digital Ocean has datacenters in certain world regions. While you can create a droplet at all of their regions, not all provide Spaces, too. I suggest finding a region that is geographically near you **and** provides both services to have shorter latencies

- Buy a domain at a domain registrar (NameCheap, Google Domains, GoDaddy, ...) and [register the domain at Digital Ocean](https://docs.digitalocean.com/products/networking/dns/how-to/add-domains/)
- [Create a SSH key and upload your Public Key to Digital Ocean](https://docs.digitalocean.com/products/droplets/how-to/add-ssh-keys/to-account/). It is used to authenticate when logging into the droplet later on
- Create a Digital Ocean [Personal Access Token](https://docs.digitalocean.com/reference/api/create-personal-access-token/) (or [watch me do it](img/create-personal-access-token.gif))
- (optional) Enable [Digital Ocean Spaces](https://www.digitalocean.com/producs/spaces) in your DO Control Panel and [create a Access Key/Secret Key](https://docs.digitalocean.com/products/spaces/how-to/manage-access/) pair (or [watch me do it](img/create-spaces-key.gif)). I wrote some [explanation, pros and cons of using Spaces](spaces-benefits.md) which you might find interesting.

# Installation

## 1. Create a Droplet (or [watch me do it](img/create-droplet.gif))

**Notes:**

- For a single Foundry VTT server, the **smallest sizing** is more than enough
- Choose **Debian 11** as your operating system, I have not tested the utility on other distributions
- Choose a datacenter near you to host your Droplet. If you want to use Digital Ocean Spaces, I would advice to place your Droplet into the same region as Spaces, which is not available in every region
- Select your pre-supplied SSH key to be added into the droplet, this allows you to connect via ssh in the next step.
- _(optional)_ I enabled monitoring to get a quick glance about the resources used by the droplet from the Digital Ocean Control Panel
- Use any hostname to your liking. I added a tag to the Droplet for easier management, but if you do not have plenty of Droplets you can omit that step without sacrificing anything

**Steps:**

1. Open a console window ([watch me do it](img/open-console.gif))
2. Execute the pre-install script found in this repository. It updates the system and installs all necessary components by pasting the following command into your shell: `curl -fsSL https://raw.githubusercontent.com/VTTAssets/vtta-crucible/main/install.sh | bash -`. The installation process will take a couple of minutes to finish ([watch me do it](img/install-requirements.gif))
