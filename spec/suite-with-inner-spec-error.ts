import {anObject} from "./an-object";

describe('suite-error', () => {
  it('should work as expected', () => {
    expect(anObject.methodThatDoesExist()).toBe(true);
  });
  
  describe('inner suite', () => {
    it('should throw an error message', () => {
      expect((anObject as any).callingAMethodThatDoesNotExist()).toBe(false);
    });
  });
});
