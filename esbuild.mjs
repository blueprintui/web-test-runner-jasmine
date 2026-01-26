import { build } from 'esbuild';

// We currently bundle jasmine-core due to some monorepo setups do not have a consistent path to jasmine-core
// node_modules may be hoisted to parent directories and jasmine-core may not be in the same directory as this package.
// This is a temporary solution, later versions will likely leverage configurable import maps
// https://github.com/blueprintui/web-test-runner-jasmine/pull/29

await build({
  entryPoints: ['dist/jasmine/index.js'],
  bundle: true,
  outfile: 'dist/jasmine/index.js', // replace the tsc output with the bundled output containing jasmine-core
  external: ['@web/test-runner-core'],
  format: 'esm',
  platform: 'browser',
  allowOverwrite: true
});
