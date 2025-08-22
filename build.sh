#!/bin/bash
set -e

echo "=== Railway Build Script ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

echo "=== Installing dependencies ==="
npm ci

echo "=== Generating Prisma client ==="
npx prisma generate

echo "=== Building application ==="
npm run build

echo "=== Build completed successfully ==="