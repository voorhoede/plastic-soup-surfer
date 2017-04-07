#!/bin/sh

ssh -i ../keys/digital_ocean root@37.139.20.118 "cd /usr/src/app && git pull && pm2 reload server"