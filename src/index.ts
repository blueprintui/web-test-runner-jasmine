import fs from 'fs';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import type {TestRunnerConfig, TestRunnerCoreConfig} from "@web/test-runner";
import type {JasmineConfig} from "./jasmine-config";
import * as path from "path";

const require = createRequire(import.meta.url);

const jasmineStylesheets = 'node_modules/jasmine-core/lib/jasmine-core/jasmine.css';
const jasmineScripts = [
  'jasmine.js',
  'jasmine-html.js',
  'boot0.js',
  'boot1.js',
].map(script => `node_modules/jasmine-core/lib/jasmine-core/${script}`);

const jasmineInit = pathToFileURL(require.resolve('./jasmine-init.js'));

export const jasmineTestRunnerConfig = (): Partial<TestRunnerConfig> => {
  return {
    testRunnerHtml: (_testRunnerImport: string, config: TestRunnerCoreConfig): string => {
      const jasmineConfig = config.testFramework?.config as (JasmineConfig | undefined);
      const styles = [jasmineStylesheets, ...(jasmineConfig?.styles ?? [])].map(x => path.resolve(config.rootDir, x).replace(config.rootDir, ''));
      const scripts = [...jasmineScripts, ...(jasmineConfig?.scripts ?? [])].map(x => path.resolve(config.rootDir, x).replace(config.rootDir, ''));
      const matchers = [...(jasmineConfig?.matchers ?? [])].map(x => path.resolve(config.rootDir, x).replace(config.rootDir, ''));

      return `
        <html>
          <head>
            ${styles.map(style => `<link rel="stylesheet" href="${style}">`).join('\n') ?? ''}
          </head>
          <body>
            <script>window.process = { env: { NODE_ENV: "development" } }</script>
            ${scripts.map(script => `<script src="${script}"></script>`).join('\n')}
            <script>
                (() => { 
                    window.initJasmine = window.onload; 
                    window.onload = () => {}
                })()
            </script>
            <script type="module">
                ${fs.readFileSync(jasmineInit, 'utf8')}
                ${matchers.map(matcher => `import '${matcher}';`).join('\n')}
            </script>
            </body>
        </html>
      `;
    }
  }
}

export {JasmineConfig};