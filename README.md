# Plastic Soup Surfer site

Live at [www.plasticsoupsurfer.org](https://www.plasticsoupsurfer.org/).

## Getting started

Running this project also requires a **.env** file!
This file contains passwords and keys for all the required service and might be different for each environment.
It is not commited to the repo!
(Please ask Bas or Remco to send you the .env file)

## Dev environment

```bash
npm install
npm run build
npm run dev
```

Visit the site at [localhost:8080](http://localhost:8080)

## Production environment

```bash
set NODE_ENV production
npm install
npm run build
npm start
```

Visit the site at [localhost:8080](http://localhost:8080)

## Deploy
To deploy run `npm run deploy`, this runs the [Now CLI](https://github.com/zeit/now-cli). Make sure Now is configured to run under `devoorhoede` team.

## Style

We use less for styling the plastic soup site. Nothing special...

## JS

We use buble and rollup to build our js in de modular way.
Each component folder has a js with the name of the folder (so the folder header has header.js).
These "component js files" are the entry points of the rollup process. Other js files can be imported using es6 imports.

## GPS

During his travels the plastic soup surfer periodically sends gps signals to the webhook at `/api/webhook/gps`.
This webhook saves the gps locations to the contentful cms. This causes the contentful cms to trigger a webhook at `/api/webhook/contentful` which will cache the latest contentful data.

## CMS

The CMS we use is [Contentful](https://www.contentful.com). Ask Remco for the log in credentials or check LastPass.

## NPM scripts

`npm run ...` | Description
--- | ---
`build` | builds the js and style, copies the fonts to the destination folder and compresses the images
`dev` | starts the development server and watches files for changes (`start:dev` & `watch`)
`start` | starts the production server
`start:dev` | only starts the development server
`watch` | only watches the assets

## Tools

The tools contains a couple of scripts to the test the gps and webhook functionality.

`test_gps.sh` | tests the gps webhook. The payload in the test should match the payload which is being send from the gps device. The response should be: `{"status" : "ok"}`

`test_webhook.sh` | test the contentful webhook. This will cache the latest contentful data. **During development this webhook should be called everytime you change something in the cms!**

# Requirements

- Node >= 7.6
