import {testFile} from "./utils/test-file.js";

it('should display errors in the terminal with correct number of passed and failed', async () => {
  const testResult = await testFile("spec/suite-with-inner-spec-error.ts");

  expect(testResult.code).toEqual(1);
  expect(testResult.terminalOutput).not.toContain('Error while running tests.');
  expect(testResult.terminalOutput).toContain(`1/1 test files | 1 passed, 1 failed`);
  expect(testResult.terminalOutput).toContain(`❌ suite-error inner suite should throw an error message`);
  expect(testResult.terminalOutput).toContain(`TypeError: anObject.callingAMethodThatDoesNotExist is not a function`);
  expect(testResult.terminalOutput).withContext("with link to error").toContain("(spec/suite-with-inner-spec-error.ts:10:31)");
});
