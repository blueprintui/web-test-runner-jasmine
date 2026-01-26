/// <reference types="jasmine" />

import { getConfig, sessionFailed, sessionFinished, sessionStarted, TestResultError, TestSuiteResult } from '@web/test-runner-core/browser/session.js';

// Inline ANSI color codes (replaces ansi-colors dependency)
const yellow = (s: string) => `\x1b[33m${s}\x1b[39m`;
const green = (s: string) => `\x1b[32m${s}\x1b[39m`;
const red = (s: string) => `\x1b[31m${s}\x1b[39m`;

// Inline assertion (replaces assert dependency)
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

// === Jasmine initialization (from jasmine.ts) ===
// @ts-ignore
const jasmineRequire = await import('jasmine-core/lib/jasmine-core/jasmine.js');
const jasmine = jasmineRequire.core(jasmineRequire);
const env: jasmine.Env = jasmine.getEnv();
Object.assign(window, jasmineRequire.interface(jasmine, env));

// === Suite node types and helpers (from suite-nodes.ts) ===
interface SuiteNode {
  id: string | null;
  name: string;
  suites: SuiteNode[];
  passed: boolean;
  tests: SpecNode[];
}

interface SpecNode {
  id: string;
  name: string;
  passed: boolean;
  skipped: boolean;
  duration: number | null;
  errors?: TestResultError[];
}

function isSuiteNode(n: SuiteNode | SpecNode): n is SuiteNode {
  return (n as Partial<SuiteNode>).suites !== undefined;
}

const findParentNode = (treeNode: SpecNode | SuiteNode, result: jasmine.SpecResult | jasmine.SuiteResult): SuiteNode | null => {
  if (treeNode.id === result.parentSuiteId && isSuiteNode(treeNode)) {
    return treeNode;
  } else if (isSuiteNode(treeNode)) {
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

const findResultNode = (treeNode: SpecNode | SuiteNode, result: jasmine.SpecResult | jasmine.SuiteResult): SpecNode | SuiteNode | null => {
  if (treeNode.id === result.id) {
    return treeNode;
  }
  if (isSuiteNode(treeNode)) {
    for (let i = 0; i < treeNode.tests.length; i++) {
      const childTest = treeNode.tests[i];
      const elementFound = findResultNode(childTest, result);
      if (elementFound) {
        return elementFound;
      }
    }
  }
  if (isSuiteNode(treeNode)) {
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

// === Console reporter (from console-reporter.ts) ===
interface ConsoleReporterOptions {
  print: (text: string) => void;
  showColors: boolean;
}

function createConsoleReporter(): jasmine.CustomReporter & { setOptions: (options: ConsoleReporterOptions) => void } {
  let print: (text: string) => void = () => {};
  let showColors = false;
  let specCount = 0;
  let failureCount = 0;
  let pendingCount = 0;
  const failedSpecs: jasmine.SpecResult[] = [];

  const colorize = (text: string, colorFn: (s: string) => string) =>
    showColors ? colorFn(text) : text;

  return {
    setOptions(options: ConsoleReporterOptions) {
      print = options.print;
      showColors = options.showColors;
    },

    specDone(result: jasmine.SpecResult) {
      specCount++;
      if (result.status === 'passed') {
        print(colorize('.', green));
      } else if (result.status === 'pending') {
        pendingCount++;
        print(colorize('*', yellow));
      } else if (result.status === 'failed') {
        failureCount++;
        failedSpecs.push(result);
        print(colorize('F', red));
      }
    },

    jasmineDone() {
      print('\n\n');

      if (failedSpecs.length > 0) {
        print('Failures:\n');
        for (let i = 0; i < failedSpecs.length; i++) {
          const spec = failedSpecs[i];
          print(`${i + 1}) ${spec.fullName}\n`);
          for (const expectation of spec.failedExpectations) {
            print(colorize(`   ${expectation.message}\n`, red));
            if (expectation.stack) {
              print(`   ${expectation.stack}\n`);
            }
          }
          print('\n');
        }
      }

      const summary = `${specCount} spec${specCount === 1 ? '' : 's'}, ${failureCount} failure${failureCount === 1 ? '' : 's'}`;
      const pendingSummary = pendingCount > 0 ? `, ${pendingCount} pending` : '';
      print(summary + pendingSummary + '\n');
    }
  };
}

// === JasmineConfig type (from types.ts) ===
interface JasmineConfig extends jasmine.Configuration {
  defaultTimeoutInterval?: number;
}

// === Main framework logic ===
const suiteErrors: TestResultError[] = [];

const buildTestResults = (jasmineTreeNode: SpecNode | SuiteNode): TestSuiteResult => {
  const treeNode: TestSuiteResult = {
    name: jasmineTreeNode.name,
    suites: [],
    tests: [],
  };
  if (isSuiteNode(jasmineTreeNode)) {
    for (let i = 0; i < jasmineTreeNode.tests.length; i++) {
      const jasmineTestNode = jasmineTreeNode.tests[i];
      treeNode.tests.push({
        name: jasmineTestNode.name,
        passed: jasmineTestNode.passed,
        skipped: jasmineTestNode.skipped,
        duration: jasmineTestNode.duration ?? undefined,
        error: jasmineTestNode.errors?.[0]
      });
    }
  }

  if (isSuiteNode(jasmineTreeNode)) {
    for (let i = 0; i < jasmineTreeNode.suites.length; i++) {
      const jasmineSuiteNode = jasmineTreeNode.suites[i];
      treeNode.suites.push(buildTestResults(jasmineSuiteNode));
    }
  }
  return treeNode;
};

const failedExpectationToError = (e: jasmine.FailedExpectation, runnableName: string): TestResultError => {
  return {
    message: yellow(`\n\n${e.message}\n`),
    name: runnableName,
    stack: e.stack,
  };
}

const jasmineRootTreeNode: SuiteNode = {
  id: null,
  name: "",
  suites: [],
  tests: [],
  passed: true,
};

env.addReporter({
  jasmineStarted: _suiteInfo => { },
  suiteStarted: result => {
    const newNode: SuiteNode = {
      id: result.id,
      name: result.description,
      passed: true,
      tests: [],
      suites: [],
    };

    if (!result.parentSuiteId) {
      jasmineRootTreeNode.suites.push(newNode);
    } else {
      const nodeFound = findParentNode(jasmineRootTreeNode, result);
      assert(nodeFound, 'Expected parent suite to be found.');
      nodeFound.suites.push(newNode);
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
          name: result.description,
          passed: true,
          duration: null,
          skipped: false,
        });
      }
    }
  },
  specDone: result => {
    const nodeFound = findResultNode(jasmineRootTreeNode, result);

    if (nodeFound === null) {
      throw new Error(`Could not find result node for spec: ${result.id}`);
    }
    if (isSuiteNode(nodeFound)) {
      throw new Error(`Unexpectedly found suite node, while spec node was expected: ${result.id}`);
    }

    nodeFound.passed = result.status === "passed" || result.status === 'pending';
    nodeFound.skipped = result.status === 'pending';
    nodeFound.duration = result.duration;

    if (result.failedExpectations && result.failedExpectations.length > 0) {
      nodeFound.errors = [];
      for (let i = 0; i < result.failedExpectations.length; i++) {
        nodeFound.errors.push(failedExpectationToError(
          result.failedExpectations[i], result.description));
      }
    }
  },
  suiteDone: result => {
    const nodeFound = findResultNode(jasmineRootTreeNode, result);
    if (nodeFound === null) {
      throw new Error(`Could not find result node for suite: ${result.id}`);
    }
    nodeFound.passed = result.status === "passed";

    for (let i = 0; i < result.failedExpectations.length; i++) {
      suiteErrors.push(failedExpectationToError(
        result.failedExpectations[i], result.fullName));
    }
  },
  jasmineDone: result => {
    for (let i = 0; i < result.failedExpectations.length; i++) {
      suiteErrors.push(failedExpectationToError(
        result.failedExpectations[i], 'Error at the top level'));
    }
  }
});

(async () => {
  sessionStarted();
  const { testFile, debug, testFrameworkConfig } = await getConfig();
  const config = { defaultTimeoutInterval: 5000, ...(testFrameworkConfig ?? {}) } as JasmineConfig;

  jasmine.DEFAULT_TIMEOUT_INTERVAL = config.defaultTimeoutInterval;

  if (debug) {
    const consoleReporter = createConsoleReporter();
    let stdout = '';
    consoleReporter.setOptions({
      print: (t: string) => stdout += t,
      showColors: true
    });
    env.addReporter(consoleReporter);
    env.addReporter({
      jasmineDone: () => {
        console.log(stdout);
      }
    })
  }

  try {
    env.configure(config);
    await import(new URL(testFile, document.baseURI).href);

    const result = await env.execute();

    if (result.incompleteReason) {
      suiteErrors.push({ message: result.incompleteReason });
    }
    if (result.order.random) {
      console.log(`Jasmine randomize seed: ${result.order.seed}`);
    }

    sessionFinished({
      passed: result.overallStatus === 'passed',
      testResults: buildTestResults(jasmineRootTreeNode),
      errors: suiteErrors,
    });
  } catch (error) {
    console.log(error);
    sessionFailed(error);
    return;
  }
})();
