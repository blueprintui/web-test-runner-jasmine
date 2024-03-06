import {testFile} from "./utils/test-file.js";

it('should display errors with a stack trace when an error occurs outside of a spec', async () => {
  const testResult = await testFile("spec/error-in-describe.ts");

  expect(testResult.code).toEqual(1);
  expect(testResult.terminalOutput).toContain(`1/1 test files | 0 passed, 0 failed`);
  expect(testResult.terminalOutput).toContain(`❌ an error inside a describe block: TypeError: anObject.callingAMethodThatDoesNotExist is not a function`);
  expect(testResult.terminalOutput).withContext("with link to error").toContain("spec/error-in-describe.ts:5:20");
});
