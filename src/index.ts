import { defaultReporter } from '@web/test-runner';
import fs from 'fs';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
const require = createRequire(import.meta.url);
const jasminePath = pathToFileURL(require.resolve('jasmine-core/lib/jasmine-core/jasmine.js'));

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
        <html>
          <head>
            ${testFramework.config.styles.map(style => `<style>${fs.readFileSync(style, 'utf8')}</style>`).join('\n')}
            <script>window.process = { env: { NODE_ENV: "development" } }</script>
            <script>${fs.readFileSync(jasminePath, 'utf8')}</script>
            <script type="module">
              import { getConfig, sessionStarted, sessionFinished, sessionFailed } from '@web/test-runner-core/browser/session.js';
  
              const testFramework = {
                ...${JSON.stringify(testFramework)}
              };
  
              const jasmine = jasmineRequire.core(window.jasmineRequire);
              jasmine.DEFAULT_TIMEOUT_INTERVAL = testFramework.config.timeout;
              const global = jasmine.getGlobal();
              global.jasmine = jasmine;
              const env = jasmine.getEnv();
              Object.assign(window, jasmineRequire.interface(jasmine, env));
              window.onload = function () {};
  
              const findParentNode = (treeNode, result) => {
                if (treeNode.id === result.parentSuiteId) {
                  return treeNode;
                } else if (treeNode.suites) {
                  for (let i = 0; i < treeNode.suites.length; i++) {
                    const childSuite = treeNode.suites[i];
                    const elementFound = findParentNode(childSuite, result);
                    if (elementFound) {
                      return elementFound;
                    }
                  }
                }
                return null;
              };
              const findResultNode = (treeNode, result) => {
                if (treeNode.id === result.id) {
                  return treeNode;
                }
                if (treeNode.tests) {
                  for (let i = 0; i < treeNode.tests.length; i++) {
                    const childTest = treeNode.tests[i];
                    const elementFound = findResultNode(childTest, result);
                    if (elementFound) {
                      return elementFound;
                    }
                  }
                }
                if (treeNode.suites) {
                  for (let i = 0; i < treeNode.suites.length; i++) {
                    const childSuite = treeNode.suites[i];
                    const elementFound = findResultNode(childSuite, result);
                    if (elementFound) {
                      return elementFound;
                    }
                  }
                }
                return null;
              };
              const buildTestResults = (jasmineTreeNode) => {
                const treeNode = {
                  name: jasmineTreeNode.name
                };
                if (jasmineTreeNode.tests) {
                  treeNode.tests = [];
                  for (let i = 0; i < jasmineTreeNode.tests.length; i++) {
                    const jasmineTestNode = jasmineTreeNode.tests[i];
                    treeNode.tests.push({
                      name: jasmineTestNode.name,
                      passed: jasmineTestNode.passed,
                      skipped: jasmineTestNode.skipped,
                      duration: jasmineTestNode.duration,
                      error: jasmineTestNode.errors?.[0]
                    });
                  }
                }
                if (jasmineTreeNode.suites) {
                  treeNode.suites = [];
                  for (let i = 0; i < jasmineTreeNode.suites.length; i++) {
                    const jasmineSuiteNode = jasmineTreeNode.suites[i];
                    treeNode.suites.push(buildTestResults(jasmineSuiteNode));
                  }
                }
                return treeNode;
              };
  
              const failedSpecs = [];
              const failedImports = [];
  
              const jasmineRootTreeNode = {
                id: null,
                name: "",
                suites: [],
                tests: []
              };
  
              env.addReporter({
                jasmineStarted: suiteInfo => {},
                suiteStarted: result => {
                  if (!result.parentSuiteId) {
                    jasmineRootTreeNode.id = result.id;
                    jasmineRootTreeNode.name = result.description;
                  } else {
                    const nodeFound = findParentNode(jasmineRootTreeNode, result);
                    if (nodeFound) {
                      nodeFound.suites.push({
                        id: result.id,
                        name: result.description,
                        suites: [],
                        tests: []
                      });
                    }
                  }
                },
                specStarted: result => {
                  if (!result.parentSuiteId) {
                    jasmineRootTreeNode.id = result.id;
                    jasmineRootTreeNode.name = result.description;
                  } else {
                    const nodeFound = findParentNode(jasmineRootTreeNode, result);
                    if (nodeFound) {
                      nodeFound.tests.push({
                        id: result.id,
                        name: result.description
                      });
                    }
                  }
                },
                specDone: result => {
                  const nodeFound = findResultNode(jasmineRootTreeNode, result);
                  nodeFound.passed = result.status === "passed";
                  nodeFound.skipped = false;
                  nodeFound.duration = result.duration;
  
                  if (result.failedExpectations && result.failedExpectations.length > 0) {
                    nodeFound.errors = [];
                    for (let i = 0; i < result.failedExpectations.length; i++) {
                      const e = result.failedExpectations[i];
  
                      const testResultError = {
                        message: result.fullName + ': ' + e.message,
                        name: result.description,
                        stack: e.stack,
                        expected: JSON.stringify(e.expected) ?? String(e.expected),
                        actual: JSON.stringify(e.actual) ?? String(e.actual)
                      };
  
                      failedSpecs.push(testResultError);
                      nodeFound.errors.push(testResultError);
                    };
                  }
                },
                suiteDone: result => {
                  const nodeFound = findResultNode(jasmineRootTreeNode, result);
                  nodeFound.passed = result.status === "passed";
                },
                jasmineDone: result => {
                  sessionFinished({
                    passed: result.overallStatus === 'passed',
                    errors: [...failedSpecs, ...failedImports],
                    testResults: buildTestResults(jasmineRootTreeNode)
                  });
                },
              });
  
              (async () => {
                sessionStarted();
                const { testFile, watch, debug, testFrameworkConfig } = await getConfig();
                const config = { defaultTimeoutInterval: 5000, ...(testFrameworkConfig ?? {}) };
  
                jasmine.DEFAULT_TIMEOUT_INTERVAL = config.defaultTimeoutInterval;
  
                await import(new URL(testFile, document.baseURI).href).catch(error => {
                  failedImports.push({ file: testFile, error: { message: error.message, stack: error.stack } });
                });
  
                try {
                  env.execute();
                } catch (error) {
                  console.log(error);
                  sessionFailed(error);
                  return;
                }
              })();
            </script>
          </head>
          <body></body>
        </html>
      `;
    }
  }
}