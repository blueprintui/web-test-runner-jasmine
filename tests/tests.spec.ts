import {testFile} from "./utils/test-file.js";

it('should display errors in the terminal with correct number of passed and failed', async () => {
  const testResult = await testFile("tests/suites/suite-error.ts");

  expect(testResult.code).toEqual(1);
  expect(testResult.terminalOutput).toContain(`1/1 test files | 1 passed, 1 failed`);
  expect(testResult.terminalOutput).toContain(`❌ should throw an error message: TypeError: anObject.callingAMethodThatDoesNotExist is not a function`);
  expect(testResult.terminalOutput).withContext("with link to error").toContain("(tests/suites/suite-error.ts:10:29)");
});

it('should display all passed for a single spec', async () => {
  const testResult = await testFile("tests/suites/spec-success.ts");

  expect(testResult.code).toEqual(0);
  expect(testResult.terminalOutput).toContain(`1/1 test files | 1 passed, 0 failed`);
  expect(testResult.terminalOutput).toContain(`all tests passed! 🎉`);
});

it('should display all passed', async () => {
  const testResult = await testFile("tests/suites/suite-success.ts");

  expect(testResult.code).toEqual(0);
  expect(testResult.terminalOutput).toContain(`1/1 test files | 2 passed, 0 failed`);
  expect(testResult.terminalOutput).toContain(`all tests passed! 🎉`);
});
