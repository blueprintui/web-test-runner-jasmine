/// <reference types="jasmine" />

import assert from 'assert';
import { getConfig, sessionFailed, sessionFinished, sessionStarted, TestResultError, TestSuiteResult } from '@web/test-runner-core/browser/session.js';
import { yellow } from 'ansi-colors';

import type { JasmineConfig } from './index';
import { findParentNode, findResultNode, isSuiteNode, SpecNode, SuiteNode } from './jasmine-suite-nodes';
// @ts-ignore
import ConsoleReporter from './console-reporter';

// @ts-ignore
window.jasmine = jasmineRequire.core(jasmineRequire);
const env: jasmine.Env = jasmine.getEnv();

// @ts-ignore
Object.assign(window, jasmineRequire.interface(jasmine, env));

const buildTestResults = (jasmineTreeNode: SpecNode|SuiteNode): TestSuiteResult => {
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

const failedImports: TestResultError[] = [];

const jasmineRootTreeNode: SuiteNode= {
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
    // Pending is synonymous for "skipped" in Jasmine. Pending tests that never complete
    // should end up as "failing" if the Jasmine individual test timeout is exceeded.
    nodeFound.skipped = result.status === 'pending';
    nodeFound.duration = result.duration;

    if (result.failedExpectations && result.failedExpectations.length > 0) {
      nodeFound.errors = [];
      for (let i = 0; i < result.failedExpectations.length; i++) {
        const e = result.failedExpectations[i];
        const testResultError: TestResultError = {
          message: yellow(`\n\n${e.message}\n`),
          name: result.description,
          stack: e.stack,
        };

        nodeFound.errors.push(testResultError);
      };
    }
  },
  suiteDone: result => {
    const nodeFound = findResultNode(jasmineRootTreeNode, result);
    if (nodeFound === null) {
      throw new Error(`Could not find result node for suite: ${result.id}`);
    }
    nodeFound.passed = result.status === "passed";
  }
});

(async () => {
  sessionStarted();
  const { testFile, debug, testFrameworkConfig } = await getConfig();
  const config: JasmineConfig = testFrameworkConfig ?? {};
  if (config.defaultTimeoutInterval === undefined) {
    config.defaultTimeoutInterval = 500;
  }

  jasmine.DEFAULT_TIMEOUT_INTERVAL = config.defaultTimeoutInterval;

  if (debug) {
    // @ts-ignore
    const consoleReporter = new ConsoleReporter();
    let stdout = '';
    consoleReporter.setOptions({
      print: (t: string) => stdout += t,
      showColors: true
    });
    env.addReporter(consoleReporter);
    env.addReporter({jasmineDone: () => {
      console.log(stdout);
    }})
  }

  try {
    env.configure(config);
    await import(new URL(testFile, document.baseURI).href);

    // Run jasmine.
    const result = await env.execute();

    const errors: TestResultError[] = [...failedImports];
    if (result.incompleteReason) {
      errors.push({message: result.incompleteReason});
    }
    if (result.order.random) {
      console.log(`Jasmine randomize seed: ${result.order.seed}`);
    }

    sessionFinished({
      passed: result.overallStatus === 'passed',
      testResults: buildTestResults(jasmineRootTreeNode),
      errors,
    });
  } catch (error) {
    console.log(error);
    sessionFailed(error);
    return;
  }
})();
