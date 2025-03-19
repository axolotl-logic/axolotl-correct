import { describe, expect, test } from "vitest";
import { add, multiply } from "../src/reference/algebra";

describe("add", () => {
  const universe = [-1, 0, 0.25, 1, NaN];

  testAssociativityOver(add, universe);
  testCommunativeOver(add, universe);
  testIdentityPropertyOver(add, 0, universe);
  testIdempotentOver(add, [0]);
});

describe("multiply", () => {
  const universe = [-1, 0, 0.25, 1, NaN];

  testAssociativityOver(multiply, universe);
  testCommunativeOver(multiply, universe);
  testIdentityPropertyOver(multiply, 1, universe);
  testIdempotentOver(multiply, [0]);
});

function testIdempotentOver<T>(f: (a: T, b: T) => T, possibleValues: T[]) {
  for (const x of possibleValues) {
    const name = `x • x should equal x, when x=${trunc(x)}`;

    test(name, () => {
      expect(f(x, x)).toEqual(x);
    });
  }
}

function testCommunativeOver<T>(f: (a: T, b: T) => T, possibleValues: T[]) {
  for (const x of possibleValues) {
    for (const y of possibleValues) {
      const name = `x • y should equal y • x, when x=${trunc(x)} y=${trunc(y)}`;

      test(name, () => {
        const left = f(x, y);
        const right = f(y, x);

        expect(left).toEqual(right);
      });
    }
  }
}

function testIdentityPropertyOver<T>(
  f: (a: T, b: T) => T,
  identity: T,
  possibleValues: T[],
) {
  for (const x of possibleValues) {
    const name = `(x • identity) should equal x, when x=${trunc(x)} identity=${trunc(identity)}`;

    test(name, () => {
      expect(f(x, identity)).toEqual(x);
    });
  }
}

function testAssociativityOver<T>(f: (a: T, b: T) => T, possibleValues: T[]) {
  for (const x of possibleValues) {
    for (const y of possibleValues) {
      for (const z of possibleValues) {
        const name = `(x + y) + z should equal x + (y + z), where x=${trunc(x)} y=${trunc(y)} z=${trunc(z)}`;

        test(name, () => {
          const left = f(f(x, y), z);
          const right = f(x, f(y, z));

          expect(left).toEqual(right);
        });
      }
    }
  }
}

function trunc<T>(v: T) {
  const str = JSON.stringify(v);
  const maxLength = 8;
  if (str.length > maxLength) {
    return str.substring(0, maxLength - 3) + "...";
  }

  return str;
}
