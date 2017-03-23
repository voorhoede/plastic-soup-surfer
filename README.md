# Plastic Soup Surfer site

## Structure

- nginx is used for hosting the static files
- the app folder contains the files for the koa server which serves the payment, gps routes
- the render folder contains the files for the koa server which serves the contentful webhook receiver
- the src folder contains the source for the site
- the dist folder contains the static assets for the site (these are served by the nginx server)

## Dev environment

    docker-compose -f docker-compose.dev.yml up

Visit the site at localhost:8080

## Prod environment

Todo