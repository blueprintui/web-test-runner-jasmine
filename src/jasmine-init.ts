import { getConfig, sessionStarted, sessionFinished, sessionFailed } from '@web/test-runner-core/browser/session.js';
import type { TestResult, TestResultError } from "@web/test-runner-core";
import type {BrowserSessionResult, RuntimeConfig} from "@web/test-runner-core/browser/session";
import type {JasmineConfig} from "./jasmine-config";

declare global {
  interface JasmineJSApiReporter extends jasmine.CustomReporter {
    started: boolean;
    finished: boolean;
    runDetails: any;
    status(): 'loaded' | 'started' | 'done';
    executionTime(): number;
    suites(): Record<string, jasmine.SpecResult>;
    specs(): jasmine.SpecResult[];
  }

  interface Window {
    initJasmine: () => void;
    jsApiReporter: JasmineJSApiReporter;
  }
}

class JasmineWebTestRunnerReporter implements jasmine.CustomReporter {
  private _errors: TestResultError[] = [];
  
  constructor() {}
  
  jasmineStarted() {
    return sessionStarted();
  }

  jasmineDone() {
    let errors: TestResultError[] = [];
    let testResults: TestResult[] = [];
    
    window.jsApiReporter.specs().forEach(x => {
      let success = x.failedExpectations.length === 0;

      if (!success) {
        x.failedExpectations.forEach(e => {
          testResults.push({
            name: x.fullName,
            passed: false,
            skipped: false,
            error: {
              message: e.message,
              stack: e.stack,
              actual: e.actual !== '' ? e.actual : undefined,
              expected: e.expected !== '' ? e.expected : undefined,
            }
          })
          errors.push({
            name: x.fullName,
            message: e.message,
          });
        });
      } else {
        testResults.push({
          name: x.fullName,
          passed: success,
          skipped: x.status === 'disabled' || x.status === 'pending' || x.status === 'excluded',
          duration: x.duration ?? undefined,
        });
      }
    });

    const suites = window.jsApiReporter.suites();
    if (suites) {
      Object.keys(suites).forEach(x => {
        const suite = suites[x];
        if (suite.status === 'failed') {
          suite.failedExpectations.forEach(x => {
            errors.push({
              message: x.message,
              stack: x.stack,
              name: suite.fullName,
            })
          });
        }
      })
    }

    const allErrors = [...this._errors, ...errors];

    let results: BrowserSessionResult = {
      errors: allErrors,
      passed: allErrors.length === 0,
      testResults: {
        name: 'jasmine',
        tests: testResults,
        suites: [], // todo fix the suites here
      }
    }

    return sessionFinished(results);
  }

  addOutsideError(error: TestResultError) {
    console.log('outside');
    this._errors.push(error);
  }
}


const env: jasmine.Env = jasmine.getEnv();
const { testFile, testFrameworkConfig } = await getConfig() as RuntimeConfig & { testFrameworkConfig: JasmineConfig };

jasmine.DEFAULT_TIMEOUT_INTERVAL = testFrameworkConfig.defaultTimeoutInterval ?? 50000;

const reporter = new JasmineWebTestRunnerReporter();
env.addReporter(reporter);

const loadModule = async (modulePath: string) => {
  try {
    return await import(modulePath)
  } catch (error) {
    const path = new URL(testFile, document.baseURI).pathname;
    reporter.addOutsideError({ message: error.stack, name: `${path}` });
  }
}

try {
  await loadModule(new URL(testFile, document.baseURI).href)
  window.initJasmine();
} catch (e) {
  sessionFailed(e)
}
