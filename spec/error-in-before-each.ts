import {anObject} from "./an-object";

describe('before-each-error', () => {
  beforeEach(() => {
    (anObject as any).callingAMethodThatDoesNotExist();
  });

  it('should work as expected', () => {
    expect(true).toBe(true);
  });
});
