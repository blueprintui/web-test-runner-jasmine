import fs from "fs/promises";
import $ from 'dax-sh';

await $`rm -rf dist/lib`;
await $`tsc --project tsconfig.build.json`;
await $`cp README.md dist/lib/README.md`;

import packageJson from '../package.json' assert { type: 'json' };
delete packageJson.scripts;
await fs.writeFile('dist/lib/package.json', JSON.stringify(packageJson, null, 2));
