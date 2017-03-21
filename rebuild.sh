#!/bin/sh
docker-compose -f docker-compose.dev.yml exec builder npm run $1