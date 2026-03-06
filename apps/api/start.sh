#!/bin/sh
# RAOS API startup script
# Runs prisma migrations then starts the app with dumb-init as PID 1

node_modules/.bin/prisma migrate deploy || echo "[startup] Migration warning (continuing anyway)"

exec dumb-init -- node dist/main
