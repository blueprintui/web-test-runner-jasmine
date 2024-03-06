import {testFile} from "./utils/test-file.js";

it('should display all passed for a single spec', async () => {
  const testResult = await testFile("spec/success-in-spec.ts");

  expect(testResult.code).toEqual(0);
  expect(testResult.terminalOutput).toContain(`1/1 test files | 1 passed, 0 failed`);
  expect(testResult.terminalOutput).toContain(`all tests passed! 🎉`);
});
