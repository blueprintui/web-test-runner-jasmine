#!/usr/bin/env bash

set -e

npm run clean

tsc --project ./tsconfig.lib.json

esbuild --bundle \
  --outfile=dist/lib/framework.mjs \
  --external:@web/test-runner-core \
  --format=esm \
  --platform=browser \
   dist/build/framework.js

cpy "./dist/build/index*" dist/lib/
cpy ./package.json dist/lib/
cpy ./README.md dist/lib/
