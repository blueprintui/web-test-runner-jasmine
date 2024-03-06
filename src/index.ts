import fs from 'fs';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import type {TestRunnerConfig, TestRunnerCoreConfig} from "@web/test-runner";
import type {JasmineConfig} from "./jasmine-config";

const require = createRequire(import.meta.url);

const jasmineDeps = [
  'jasmine.css',
  'jasmine.js',
  'jasmine-html.js',
  'boot0.js',
  'boot1.js',
]
const [jasmineCssFile, jasmineFile, jasmineHtmlFile, jasmineBoot0File, jasmineBoot1File] = jasmineDeps
  .map(fileName => pathToFileURL(require.resolve(`jasmine-core/lib/jasmine-core/${fileName}`)))
  .map(filePath => fs.readFileSync(filePath, 'utf-8'));

const jasmineInit = pathToFileURL(require.resolve('./jasmine-init.js'));

export const jasmineTestRunnerConfig = (): Partial<TestRunnerConfig> => {
  return {
    testRunnerHtml: (_testRunnerImport: string, config: TestRunnerCoreConfig): string => {
      const testFramework = {
        config: {
          defaultTimeoutInterval: 5000,
          styles: [],
          ...(config.testFramework?.config as JasmineConfig)
        }
      };
      return `
        <html>
          <head>
            ${testFramework.config.styles.map(style => `<style>${fs.readFileSync(style, 'utf8')}</style>`).join('\n')}
            <script>window.process = { env: { NODE_ENV: "development" } }</script>
            <style>${jasmineCssFile}</style>
            <script>${jasmineFile}</script>
            <script>${jasmineHtmlFile}</script>
            <script>${jasmineBoot0File}</script>
            <script>${jasmineBoot1File}</script>
            <script>
                (() => { 
                    window.initJasmine = window.onload; 
                    window.onload = () => {}
                })()
            </script>
            <script type="module">
                const testFramework = ${JSON.stringify(testFramework)};
                ${fs.readFileSync(jasmineInit, 'utf8')}
            </script>
          </head>
          <body></body>
        </html>
      `;
    }
  }
}

export {JasmineConfig};