#!/bin/sh
set -e

echo "🗄️  Running Prisma migrations..."
NODE_ENV=production prisma migrate deploy --schema=./prisma/schema.prisma

echo "🚀 Starting Ciné-Mémo..."
exec node server.js
