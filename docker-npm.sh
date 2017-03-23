#!/bin/sh

# This bash script will install the required node_modules in the docker and update the mounted package.json

ARGS=$@

docker-compose -f docker-compose.dev.yml run node_modules sh -c "
cd /usr
ln -s /usr/src/app/node_modules node_modules
cp /usr/src/app/package.json .
npm ${ARGS}
cat package.json > /usr/src/app/package.json
rm node_modules && rm package.json
"