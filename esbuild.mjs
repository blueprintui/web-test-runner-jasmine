import {build} from 'esbuild';
import {env, nodeless} from "unenv";

const {alias, external} = env(nodeless, {})

await build({
  entryPoints: ['dist/build/framework.js'],
  bundle: true,
  outfile: 'dist/lib/framework.mjs',
  external: ['@web/test-runner-core'].concat(external),
  legalComments: 'linked',
  format: 'esm',
  platform: 'browser',
  alias,
});
