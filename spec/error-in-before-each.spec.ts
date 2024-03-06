import {testFile} from "./utils/test-file.js";

it('should display errors when they occur in a beforeEach', async () => {
  const testResult = await testFile("spec/error-in-before-each.ts");

  expect(testResult.code).toEqual(1);
  expect(testResult.terminalOutput).toContain(`1/1 test files | 0 passed, 1 failed`);
  expect(testResult.terminalOutput).toContain(`❌ before-each-error should work as expected`);
  expect(testResult.terminalOutput).toContain(`TypeError: anObject.callingAMethodThatDoesNotExist is not a function`);
  expect(testResult.terminalOutput)
    .withContext("with link to error").toContain("(spec/error-in-before-each.ts:5:22)");
});
