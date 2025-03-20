import assert from "assert";

export interface GCounter {
  values: number[];
  myId: number;
}

export function newGCounter(clusterSize: number, id: number): GCounter {
  assert(
    id < clusterSize,
    "ID must be less than cluster size as it is an index into the cluster",
  );

  assert(id >= 0, "ID must be positive as it is an index into the cluster");

  return {
    myId: id,
    values: Array.from(Array(clusterSize)).map(() => 0),
  };
}

export function mergeGCounter(a: GCounter, b: GCounter): GCounter {
  assert(a.values.length === b.values.length, "GCounters must be of same size");

  return {
    myId: a.myId,
    values: a.values.map((x, idx) => (x > b.values[idx] ? x : b.values[idx])),
  };
}

export function getValueGCounter(a: GCounter) {
  return a.values.reduce((accum, current) => accum + current, 0);
}
