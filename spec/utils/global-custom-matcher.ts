const customMatchers: jasmine.CustomMatcherFactories = {
  toBeGoofy(matchersUtil) {
    return {
      compare(actual: any, expected: any) {
        if (expected === undefined) {
          expected = '';
        }
        const result: any = {
        };
        result.pass = matchersUtil.equals(actual.hyuk,
          "gawrsh" + expected);
        if (result.pass) {
          result.message = "Expected " + actual +
            " not to be quite so goofy";
        } else {
          result.message = "Expected " + actual +
            " to be goofy, but it was not very goofy";
        }
        return result;
      }
    };
  }
};

beforeEach(() => {
  jasmine.addMatchers(customMatchers);
});
