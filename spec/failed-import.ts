// @ts-expect-error
import * as nothing from './import-that-does-not-exist';

describe('importing', () => {
  it('should throw an error when the import doesn\'t exist', () => {
    expect(nothing).toBe(undefined);
  });
});
