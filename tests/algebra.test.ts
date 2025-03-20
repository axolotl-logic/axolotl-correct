import { describe } from "vitest";
import { add, multiply } from "../src/reference/algebra";

import {
  testAssociativityOver,
  testCommunativeOver,
  testIdempotentOver,
  testIdentityPropertyOver,
} from "./helpers";

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
