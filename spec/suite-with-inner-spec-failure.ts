import {anObject} from "./an-object";

describe('suite-error', () => {
  it('should work as expected', () => {
    expect(anObject.methodThatDoesExist()).toBe(true);
  });
  
  describe('inner suite', () => {
    it('should show an error message', () => {
      expect(anObject.methodThatDoesExist()).toEqual({something: 'different'} as any);
    });
  });
});
