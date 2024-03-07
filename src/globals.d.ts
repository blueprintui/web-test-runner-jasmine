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
