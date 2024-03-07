import {testFile} from "./utils/test-file.js";

it('should display all passed in a suite of specs', async () => {
  const testResult = await testFile("spec/with-global-custom-matchers.ts", "with-custom-matchers");

  expect(testResult.code).toEqual(0);
  expect(testResult.terminalOutput).toContain(`1/1 test files | 3 passed, 0 failed`);
  expect(testResult.terminalOutput).toContain(`all tests passed! 🎉`);
});
