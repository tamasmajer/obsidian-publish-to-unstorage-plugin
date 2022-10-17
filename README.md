# An open architecture design to publish from Obsidian

There should be an easy way to free our documents from [Obsidian](https://obsidian.md).

## Design

This repo contains an [Obsidian Plugin](#obsidian-plugin) which has a publish button on the left, and a settings panel where an API key can be entered.  

There is a UI for user authentication and for displaying the markdown files. We can get the API key from there. (project: [obsidian-publish-to-unstorage-astro-ui](https://github.com/tamasmajer/obsidian-publish-to-unstorage-astro-ui))

The markdown files are stored in an [Unstorage](https://github.com/unjs/unstorage) compatible web server using the API key. (project: [unstorage-server-with-auth](https://github.com/tamasmajer/unstorage-server-with-auth)) 

We can connect to this server using a modified Unstorage http driver. (project: [unstorage-driver-http-headers](https://github.com/tamasmajer/unstorage-driver-http-headers))


So to sum it up, we get an API key from the UI, then we save a set of documents into an Unstorage server using this key, then from the UI we can display these documents. The point is that any part of the process should be customizable.


