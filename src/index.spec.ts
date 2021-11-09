describe('a test suite', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('p');
    element.innerHTML = 'hello there';
  });

  afterEach(() => {
    element.remove();
  });

  it('should create element', () => {
    expect(element.innerHTML).toBe('hello there');
  });
});
