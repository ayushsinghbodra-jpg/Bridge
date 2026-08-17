#!/bin/sh
set -e

cd /app/apps/server
npx prisma migrate deploy
exec node dist/main.js
