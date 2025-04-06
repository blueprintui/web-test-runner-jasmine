import { TestResultError } from '@web/test-runner-core';

export interface SuiteNode {
  id: string|null;
  name: string;
  suites: SuiteNode[];
  passed: boolean;
  tests: SpecNode[]
}

export interface SpecNode {
  id: string;
  name: string;
  passed: boolean;
  skipped: boolean;
  duration: number|null;
  errors?: TestResultError[],
}

export function isSuiteNode(n: SuiteNode|SpecNode): n is SuiteNode {
  return (n as Partial<SuiteNode>).suites !== undefined;
}

export const findParentNode = (treeNode: SpecNode|SuiteNode, result: jasmine.SpecResult|jasmine.SuiteResult): SuiteNode|null => {
  if (treeNode.id === result.parentSuiteId && isSuiteNode(treeNode)) {
    return treeNode;
  } else if (isSuiteNode(treeNode)) {
    for (let i = 0; i < treeNode.suites.length; i++) {
      const childSuite = treeNode.suites[i];
      const elementFound = findParentNode(childSuite, result);
      if (elementFound) {
        return elementFound;
      }
    }
  }
  return null;
};

export const findResultNode = (treeNode: SpecNode|SuiteNode, result: jasmine.SpecResult|jasmine.SuiteResult): SpecNode|SuiteNode|null => {
  if (treeNode.id === result.id) {
    return treeNode;
  }
  if (isSuiteNode(treeNode)) {
    for (let i = 0; i < treeNode.tests.length; i++) {
      const childTest = treeNode.tests[i];
      const elementFound = findResultNode(childTest, result);
      if (elementFound) {
        return elementFound;
      }
    }
  }
  if (isSuiteNode(treeNode)) {
    for (let i = 0; i < treeNode.suites.length; i++) {
      const childSuite = treeNode.suites[i];
      const elementFound = findResultNode(childSuite, result);
      if (elementFound) {
        return elementFound;
      }
    }
  }
  return null;
};
