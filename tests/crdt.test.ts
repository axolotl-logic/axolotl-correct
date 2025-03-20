import { describe } from "vitest";
import {
  GCounter,
  getValueGCounter,
  mergeGCounter,
} from "../src/reference/g-counter";
import {
  testAssociativeUnder,
  testCommunativeUnder,
  testIdempotentUnder,
} from "./helpers";

describe("mergeGCounter", () => {
  const universe: GCounter[] = [
    {
      myId: 0,
      values: [3, 1, 3, 5],
    },
    {
      myId: 1,
      values: [2, 8, 0, 0],
    },
    {
      myId: 2,
      values: [0, 0, 0, 0],
    },
    {
      myId: 3,
      values: [0, 0, 0, 0],
    },
  ];

  testAssociativeUnder(mergeGCounter, universe, getValueGCounter);
  testCommunativeUnder(mergeGCounter, universe, getValueGCounter);
  testIdempotentUnder(mergeGCounter, universe, getValueGCounter);
});
