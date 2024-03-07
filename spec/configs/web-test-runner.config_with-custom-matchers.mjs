import { playwrightLauncher } from '@web/test-runner-playwright';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { jasmineTestRunnerConfig } from '../../dist/lib/index.js'; // web-test-runner-jasmine

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  ...jasmineTestRunnerConfig(),
  testFramework: {
    config: {
      defaultTimeoutInterval: 10000,
      matchers: [
        'spec/utils/global-custom-matcher.ts'
      ],
    }
  },
  nodeResolve: true,
  browserLogs: true,
  files: [process.argv[2]],
  browsers: [playwrightLauncher({ product: 'chromium' })],
  plugins: [esbuildPlugin({ ts: true, target: 'auto' })],
});
