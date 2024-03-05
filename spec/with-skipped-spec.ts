describe('with skipped test', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
  
  it('should also work', () => {
    expect(true).toBe(true);
  });
  
  xit('should skip', () => {
    expect(true).toBe(true);
  })
});
