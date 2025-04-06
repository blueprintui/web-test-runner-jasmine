#!/usr/bin/env bash

set -e

npm run clean

tsc --project ./tsconfig.lib.json

node ./esbuild.mjs

cpy "./dist/build/index*" dist/lib/
cpy ./package.json dist/lib/
cpy ./README.md dist/lib/
