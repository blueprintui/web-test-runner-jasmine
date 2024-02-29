const anObject = {
  methodThatDoesExist: () => { return true; }
};
describe('suite-error', () => {
  it('should work as expected', () => {
    expect(anObject.methodThatDoesExist()).toBe(true);
  });
  
  it('should throw an error message', () => {
    expect((anObject as any).callingAMethodThatDoesNotExist()).toBe(false);
  });
});
