# Plastic Soup Surfer
Live at [www.plasticsoupsurfer.org](https://www.plasticsoupsurfer.org/).

## Getting started
To run this project environment variables including secrets are needed, these will be [read from a **.env** file](https://github.com/motdotla/dotenv) if present.

### Development
```bash
npm install
npm run build
npm run dev
```

### Production environment
```bash
set NODE_ENV production
npm install
npm run build
npm start
```

## Deploy
To deploy run `npm run deploy`, this runs the [Now CLI](https://github.com/zeit/now-cli). Make sure Now is configured to run under `devoorhoede` team.

## Style
For styling [Less](http://lesscss.org/) is used following the [BEM naming methodology](http://getbem.com/).

## JS
We use buble and rollup to build our js in de modular way.
Each component folder has a js with the name of the folder (so the folder header has header.js).
These "component js files" are the entry points of the rollup process. Other js files can be imported using es6 imports.

## GPS
During his travels the plastic soup surfer periodically sends gps signals to the webhook at `/api/webhook/gps`.
This webhook saves the gps locations to the contentful cms. This causes the contentful cms to trigger a webhook at `/api/webhook/contentful` which will cache the latest contentful data.

## CMS
The CMS we use is [Contentful](https://www.contentful.com).

## Tools
The tools contains a couple of scripts to the test the gps and webhook functionality.

`test_gps.sh` | tests the gps webhook. The payload in the test should match the payload which is being send from the gps device. The response should be: `{"status" : "ok"}`

`test_webhook.sh` | test the contentful webhook. This will cache the latest contentful data. **During development this webhook should be called everytime you change something in the cms!**
