import { describe } from "vitest";
import { add, multiply } from "../src/reference/algebra";

import {
  testAssociativeUnder,
  testCommunativeUnder,
  testIdempotentUnder,
  testIdentityUnder,
} from "./helpers";

describe("add", () => {
  const universe = [-1, 0, 0.25, 1, NaN];

  testAssociativeUnder(add, universe);
  testCommunativeUnder(add, universe);
  testIdentityUnder(add, 0, universe);
  testIdempotentUnder(add, [0]);
});

describe("multiply", () => {
  const universe = [-1, 0, 0.25, 1, NaN];

  testAssociativeUnder(multiply, universe);
  testCommunativeUnder(multiply, universe);
  testIdentityUnder(multiply, 1, universe);
  testIdempotentUnder(multiply, [0]);
});
