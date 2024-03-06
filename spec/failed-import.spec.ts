import {testFile} from "./utils/test-file.js";

it('should display errors when an import fails', async () => {
  const testResult = await testFile("spec/failed-import.ts");

  expect(testResult.code).toEqual(1);
  expect(testResult.terminalOutput).toContain(`1/1 test files | 0 passed, 0 failed`);
  expect(testResult.terminalOutput).toContain(`❌ /spec/failed-import.ts: TypeError: Failed to fetch dynamically imported module: http://localhost:8000/spec/failed-import.ts`);
});
