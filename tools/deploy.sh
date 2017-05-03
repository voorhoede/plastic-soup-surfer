#!/bin/sh

ssh -i ../keys/digital_ocean root@37.139.20.118 "cd /usr/src/app && git fetch --all && git reset --hard origin/master && npm install && npm run build && pm2 reload server"