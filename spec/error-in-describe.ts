import {anObject} from "./an-object";

describe('an error inside a describe block', () => {

  (anObject as any).callingAMethodThatDoesNotExist();

  it('should display an error', () => {
    expect(anObject.methodThatDoesExist()).toBe(true);
  });
});
