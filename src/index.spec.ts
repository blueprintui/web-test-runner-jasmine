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

  xdescribe('should fail', () => {
    it('should properly handle elements in expectations', () => {
      expect('test' as any).toBe(document.body);
    });


    it('should properly diff objects', () => {
      expect({a: 1, b: undefined} as {a: number, b?: number}).toEqual({a: 1, b: 1});
    });

    it('should not be marked as pending and should fail', (done) => {});
  });

  describe('an inner test suite', () => {
    it("should always be true: Level 2", () => {
      expect(true).toBeTrue();
      expect(undefined).toBeUndefined();
      expect(null).toBeNull();
      expect(["foo", "bar"]).toHaveSize(2);
      expect({ "foo": "bar" }).toEqual({ "foo": "bar" });
    });
    describe('another inner test suite', () => {
      it("should always be true: level 3", () => {
        expect(true).toBeTrue();
        expect(undefined).toBeUndefined();
        expect(null).toBeNull();
        expect(["foo", "bar"]).toHaveSize(2);
        expect({ "foo": "bar" }).toEqual({ "foo": "bar" });
      });
    });
  });
});
