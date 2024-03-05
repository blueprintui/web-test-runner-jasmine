import {testFile} from "./utils/test-file.js";

it('should work with skipped specs', async () => {
  const testResult = await testFile("spec/with-skipped-spec.ts");

  expect(testResult.code).toEqual(0);
  expect(testResult.terminalOutput).toContain(`1/1 test files | 2 passed, 0 failed, 1 skipped`);
  expect(testResult.terminalOutput).toContain(`all tests passed! 🎉`);
});
