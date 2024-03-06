import { playwrightLauncher } from '@web/test-runner-playwright';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { jasmineTestRunnerConfig } from './dist/lib/index.js'; // web-test-runner-jasmine

const isConsumerTestFile = process.argv[2].endsWith('.ts');

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  ...jasmineTestRunnerConfig(),
  testFramework: {
    config: {
      defaultTimeoutInterval: 10000
    },
  },
  nodeResolve: true,
  browserLogs: true,
  files: [isConsumerTestFile ? process.argv[2] : './src/*.spec.ts'],
  browsers: [playwrightLauncher({ product: 'chromium' })],
  plugins: [esbuildPlugin({ ts: true, json: true, target: 'auto', sourceMap: true })],
  coverageConfig: {
    require: ['ts-node/register'],
    extension: ['.ts'],
    report: true,
    reportDir: 'dist/coverage',
    threshold: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
});
