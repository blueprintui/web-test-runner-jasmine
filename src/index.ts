import { defaultReporter } from '@web/test-runner';
import fs from 'fs';
import path from 'path';

export interface JasmineConfig {
  /** https://jasmine.github.io/api/edge/jasmine.html#.DEFAULT_TIMEOUT_INTERVAL */
  defaultTimeoutInterval?: number;
  /** @deprecated use defaultTimeoutInterval */
  timeout?: number;
  styles?: []
}

export const jasmineTestRunnerConfig = () => {
  return {
    reporters: [
      defaultReporter({ reportTestResults: true, reportTestProgress: true })
    ],
    testRunnerHtml: (_path: any, config: { testFramework: { config?: JasmineConfig } }) => {
      const testFramework = {
        path: './node_modules/jasmine-core/lib/jasmine-core/jasmine.js',
        config: {
          defaultTimeoutInterval: 5000,
          styles: [],
          ...config.testFramework?.config
        }
      };
      return /* html */`
        <!DOCTYPE html>
        <html>
          <head>
            ${testFramework.config.styles.map(style => `<style>${fs.readFileSync(style, 'utf8')}</style>`).join('\n')}
            <script>window.process = { env: { NODE_ENV: "development" } }</script>
            <script type="module">
              globalThis.testFramework = {...${JSON.stringify(testFramework)}};
            </script>
            <script type="module">
              ${fs.readFileSync(path.join(import.meta.dirname, 'framework.mjs'), 'utf8')}
            </script>
          </head>
          <body></body>
        </html>
      `;
    }
  }
}
