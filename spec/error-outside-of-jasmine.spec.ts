import {testFile} from "./utils/test-file.js";

it('should display an error when it occurs outside of jasmine', async () => {
  const testResult = await testFile("spec/error-outside-of-jasmine.ts");

  expect(testResult.code).toEqual(1);
  expect(testResult.terminalOutput).toContain(`1/1 test files | 0 passed, 0 failed`);
  expect(testResult.terminalOutput).toContain(`❌ /spec/error-outside-of-jasmine.ts: TypeError: anObject.methodThatDoesNotExist is not a function`);
});
