# An open architecture design to publish from Obsidian

There should be an easy way to free our documents from [Obsidian](https://obsidian.md).

## Design

This repo contains an Obsidian plugin which has a publish button on the left, and a settings panel where an API key can be entered.  

There is a standalone website for user authentication and for displaying the saved markdown files. We can get the API key from there. (Repo: [obsidian-publish-to-unstorage-astro-ui](https://github.com/tamasmajer/obsidian-publish-to-unstorage-astro-ui))

The markdown files are stored in an [Unstorage](https://github.com/unjs/unstorage) compatible web server using the API key. (Repo: [unstorage-server-with-auth](https://github.com/tamasmajer/unstorage-server-with-auth)) 

We can connect to this server using a modified Unstorage http driver. (Repo: [unstorage-driver-http-headers](https://github.com/tamasmajer/unstorage-driver-http-headers))


So to sum it up, we get an API key from the UI, then we save a set of documents into an Unstorage server using this key, then from the UI we can display these documents. The point is that any part of the process should be customizable.


## Install

- It needs a running Unstorage server from [here](https://github.com/tamasmajer/unstorage-server-with-auth). 
- It needs a running UI from [here](https://github.com/tamasmajer/obsidian-publish-to-unstorage-astro-ui). 
- The plugin itself could be copied into an Obsidan vault to try it out (into the .obsidian/plugins folder). You need to install dependencies with `npm i`. If you modify it, run `npm run dev` and restart Obsidian after each modification. You can find more info [here](https://github.com/obsidianmd/obsidian-sample-plugin).
