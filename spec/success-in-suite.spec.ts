import {testFile} from "./utils/test-file.js";

it('should display all passed in a suite of specs', async () => {
  const testResult = await testFile("spec/success-in-suite.ts");

  expect(testResult.code).toEqual(0);
  expect(testResult.terminalOutput).toContain(`1/1 test files | 2 passed, 0 failed`);
  expect(testResult.terminalOutput).toContain(`all tests passed! 🎉`);
});
