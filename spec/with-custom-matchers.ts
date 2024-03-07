import {goofyCustomMatchers} from "./utils/custom-matcher";

describe("Custom matcher: 'toBeGoofy'", function() {
  
  beforeEach(() => {
    jasmine.addMatchers(goofyCustomMatchers);
  });
  
  it("is available on an expectation", function() {
    expect({
      hyuk: 'gawrsh'
    }).toBeGoofy();
  });

  it("can take an 'expected' parameter", function() {
    expect({
      hyuk: 'gawrsh is fun'
    }).toBeGoofy(' is fun');
  });

  it("can be negated", function() {
    expect({
      hyuk: 'this is fun'
    }).not.toBeGoofy();
  });
});
