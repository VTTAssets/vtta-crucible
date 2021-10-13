# Benefits of using Object Storage (Digital Ocean Spaces)

When you create a droplet, it comes with a 25GB disk that contains the operating system and that can be used to store user data, too. You can add an additional block device to that droplet, basically adding a second hard drive to it and increasing the amount of data you can store.

In constrast to adding a second hard drive you could employ Digital Ocean Spaces by enabling that in your Digital Ocean Control Panel. It adds $5 per month for 250GB of spaces, which is reasonably cheaper than a block device **and** has additional benefits - if it matches your use case.

## Storage is not attached to one droplet and one droplet only

A block device is assigned to one droplet, but Spaces exist outside of the droplets (and it works a bit different than a regular hard drive, from the operating system's and application's perspective).

Storing and retrieving file from an Object Storage as Digital Ocean Spaces, AWS S3 or NetApp StorageGrid works by using HTTP requests like GET, PUT, DELETE to a programmatic interface (API) and getting results back: Either the file itself or some information that the operation succeeded or failed.

## And it's not stuck in one Foundry VTT world, too

Being not part of a droplet enables you to access the Object Storage not only from one droplet, but from all droplets, and from your home, too. Not only that, if you install multiple Foundry servers on the same droplet, they all can access everything stored in there. With a regular hard disk, everything is stored under the current world's data folder, which is not acccessible from other worlds.

Commonly shared data like battlemaps, but also contents of a Shared Module can store it's images on Spaces, rendering beautifully in all worlds and not only in one.

# Cons

The major drawback to using Spaces, or Object Storage in general is accessibility. Foundry VTT uses the S3 API to talk to Spaces and for you, as a user, it's almost transparent that it is outside of your droplet, you can upload and retrieve everything using Foundry VTT's user interface as if it was stored locally on your server's hard drive.

If you want to upload something into your Spaces from outside Foundry VTT, you will need to use different applications that talk the S3 lingo to work with the stored files. It's not integrated into a Windows Explorer or a Mac OS finder (to my knowledge), but requires third party tools.
