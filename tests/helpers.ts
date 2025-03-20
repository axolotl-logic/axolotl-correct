import { expect, test } from "vitest";

export function testIdempotentUnder<T, O>(
  f: (a: T, b: T) => T,
  possibleValues: T[],
  getValue?: (a: T) => O,
): void {
  for (const x of possibleValues) {
    const name = `x • x should equal x, when x=${trunc(x)}`;

    test(name, () => {
      const value = f(x, x);
      if (getValue) {
        expect(getValue(value)).toEqual(getValue(x));
      }
    });
  }
}

export function testCommunativeUnder<T, O>(
  f: (a: T, b: T) => T,
  possibleValues: T[],
  getValue?: (a: T) => O,
): void {
  for (const x of possibleValues) {
    for (const y of possibleValues) {
      const name = `communiative x • y should equal y • x, when x=${trunc(x)} y=${trunc(y)}`;

      test(name, () => {
        const left = f(x, y);
        const right = f(y, x);

        if (getValue !== undefined) {
          expect(getValue(left)).toEqual(getValue(right));
        } else {
          expect(left).toEqual(right);
        }
      });
    }
  }
}

export function testIdentityUnder<T>(
  f: (a: T, b: T) => T,
  identity: T,
  possibleValues: T[],
): void {
  for (const x of possibleValues) {
    const name = `(x • identity) should equal x, when x=${trunc(x)} identity=${trunc(identity)}`;

    test(name, () => {
      expect(f(x, identity)).toEqual(x);
    });
  }
}

export function testAssociativeUnder<T, O>(
  f: (a: T, b: T) => T,
  possibleValues: T[],
  getValue?: (a: T) => O,
): void {
  for (const x of possibleValues) {
    for (const y of possibleValues) {
      for (const z of possibleValues) {
        const name = `(x • y) • z should equal x • (y • z), where x=${trunc(x)} y=${trunc(y)} z=${trunc(z)}`;

        test(name, () => {
          const left = f(f(x, y), z);
          const right = f(x, f(y, z));

          if (getValue !== undefined) {
            expect(getValue(left)).toEqual(getValue(right));
          } else {
            expect(left).toEqual(right);
          }
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
