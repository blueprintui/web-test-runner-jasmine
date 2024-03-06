# web-test-runner-jasmine

[![npm version](https://badge.fury.io/js/@jcoup%2Fweb-test-runner-jasmine.svg)](https://badge.fury.io/js/@jcoup%2Fweb-test-runner-jasmine) ![CI Build](https://github.com/jamcoupe/web-test-runner-jasmine/actions/workflows/build.yml/badge.svg)

A [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/) plugin for running Jasmine.

## Setup

Import `jasmineTestRunnerConfig` and add too your `web-test-runner.config.mjs`.
If using TypeScript you can add `esbuildPlugin`.

```javascript
import { playwrightLauncher } from '@web/test-runner-playwright';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { jasmineTestRunnerConfig } from 'web-test-runner-jasmine';

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  ...jasmineTestRunnerConfig(),
  testFramework: {
    config: {
      defaultTimeoutInterval: 5000
    },
  },
  nodeResolve: true,
  files: ['./src/*.spec.js'],
  browsers: [playwrightLauncher({ product: 'chromium' })],
  plugins: [esbuildPlugin({ target: 'auto', sourceMap: true })]
});
```

Once added you can use Jasmine within your tests.

```javascript
describe('a test suite', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('p');
    element.innerHTML = 'hello there';
  });

  afterEach(() => {
    element.remove();
  });

  it('should create element', () => {
    expect(element.innerHTML).toBe('hello there');
  });
});
```

To run your tests run `web-test-runner` in the terminal.

```bash
web-test-runner
```

## TypeScript

If you use TypeScript you will need to add some additional configuiration. Update your
config to read `.ts` extentions and add the `ts: true` flag to the `esBuildPlugin`.

```javascript
import { playwrightLauncher } from '@web/test-runner-playwright';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { jasmineTestRunnerConfig } from 'web-test-runner-jasmine';

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  ...
  files: ['./src/*.spec.ts'],
  plugins: [esbuildPlugin({ ts: true, json: true, target: 'auto', sourceMap: true })]
  ...
});
```

Ensure you have the `@types/jasmine` package installed and add `jasmine` to the `types`
in your `tsconfig.json`.

```json
{
  "compilerOptions": {
    ...
    "types": ["jasmine"],
    ...
  }
}
```

Learn more about [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/).