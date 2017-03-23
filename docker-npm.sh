#!/bin/sh

# This bash script will install the required node_modules in the docker and update the mounted package.json

ARGS=$@

docker-compose -f docker-compose.dev.yml run app ${ARGS}