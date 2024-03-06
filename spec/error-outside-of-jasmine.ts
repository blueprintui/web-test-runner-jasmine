import {anObject} from "./an-object";

(anObject as any).methodThatDoesNotExist();

describe('suite-error-outside-of-jasmine', () => {
  it('should work as expected', () => {
    expect(anObject.methodThatDoesExist()).toBe(true);
  });
});
