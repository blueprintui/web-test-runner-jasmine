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

describe('nested suite structure', () => {
  describe('level 2', () => {
    describe('level 3', () => {
      describe('level 4', () => {
        it('should handle deeply nested suites', () => {
          expect(true).toBe(true);
        });
      });
    });
  });
});

describe('multiple sibling suites', () => {
  describe('sibling 1', () => {
    it('test in sibling 1', () => {
      expect(1).toBe(1);
    });
  });

  describe('sibling 2', () => {
    it('test in sibling 2', () => {
      expect(2).toBe(2);
    });
  });

  describe('sibling 3', () => {
    it('test in sibling 3', () => {
      expect(3).toBe(3);
    });
  });
});

describe('multiple tests in same suite', () => {
  it('first test', () => {
    expect('a').toBe('a');
  });

  it('second test', () => {
    expect('b').toBe('b');
  });

  it('third test', () => {
    expect('c').toBe('c');
  });
});

describe('pending tests', () => {
  xit('pending test with xit', () => {
    expect(true).toBe(false);
  });

  it('pending test with pending()', () => {
    pending('reason for pending');
  });
});

describe('various matchers', () => {
  it('should work with toBeTruthy/toBeFalsy', () => {
    expect(1).toBeTruthy();
    expect(0).toBeFalsy();
  });

  it('should work with toContain', () => {
    expect([1, 2, 3]).toContain(2);
    expect('hello world').toContain('world');
  });

  it('should work with toBeGreaterThan/toBeLessThan', () => {
    expect(10).toBeGreaterThan(5);
    expect(5).toBeLessThan(10);
  });

  it('should work with toMatch', () => {
    expect('hello').toMatch(/ell/);
  });

  it('should work with toBeDefined', () => {
    const obj = { prop: 'value' };
    expect(obj.prop).toBeDefined();
  });

  it('should work with toThrow', () => {
    const throwingFn = () => {
      throw new Error('test error');
    };
    expect(throwingFn).toThrow();
  });
});

describe('async tests', () => {
  it('should handle async/await', async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });

  it('should handle done callback', (done) => {
    setTimeout(() => {
      expect(true).toBe(true);
      done();
    }, 10);
  });
});

describe('beforeEach and afterEach', () => {
  let counter = 0;

  beforeEach(() => {
    counter++;
  });

  afterEach(() => {
    counter--;
  });

  it('first test uses hooks', () => {
    expect(counter).toBe(1);
  });

  it('second test uses hooks', () => {
    expect(counter).toBe(1);
  });
});

describe('beforeAll and afterAll', () => {
  let sharedResource: string;

  beforeAll(() => {
    sharedResource = 'initialized';
  });

  afterAll(() => {
    sharedResource = '';
  });

  it('first test sees beforeAll result', () => {
    expect(sharedResource).toBe('initialized');
  });

  it('second test sees beforeAll result', () => {
    expect(sharedResource).toBe('initialized');
  });
});
