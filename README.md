# Plastic Soup Surfer site

## Structure

- nginx is used for hosting the static files
- the app folder contains the files for the koa server which serves the payment, gps routes & webhook for contentful render
- the src folder contains the source for the site
- the dist folder contains the static assets for the site (these are served by the nginx server)

## notes

- i'm using leveldb as a simple key value. Currently i only use it to save the total donated amount. It is important that the app is designed so that no 2 processes access the database (otherwise you get an error). 
- rendering the site is done in a forked node process. Template data concerning database values is passed through arguments (because of the previous point).

## Dev environment

    docker-compose -f docker-compose.dev.yml up

Visit the site at localhost:8080

## Prod environment

Todo