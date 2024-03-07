declare namespace jasmine {
  interface Matchers<T> {
    toBeGoofy(): boolean;
    toBeGoofy(expected: string): boolean;
  }
}
