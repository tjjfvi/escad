import { MultiHashMap } from "../mod.ts";

test("MultiHashMap", () => {
  const map = new MultiHashMap();
  expect(map.hasAny({ a: 1 })).toBe(false);
  map.add({ a: 1 }, 5);
  expect(map.has({ a: 1 }, 5)).toBe(true);
  expect(map.has({ a: 1 }, 7)).toBe(false);
  expect(map.hasAny({ a: 1 })).toBe(true);
  expect([...map.getAll({ a: 1 })]).toEqual([5]);
  map.add({ a: 1 }, 7);
  expect([...map.getAll({ a: 1 })]).toEqual([5, 7]);
  map.delete({ a: 1 }, 7);
  expect([...map.getAll({ a: 1 })]).toEqual([5]);
  map.deleteAll({ a: 1 });
  expect([...map.getAll({ a: 1 })]).toEqual([]);
  map.add({ a: 1 }, 10);
  map.add({ b: 1 }, 12);
  map.add({ b: 1 }, 12);
  map.add({ b: 1 }, 13);
  expect([...map.values()]).toEqual([10, 12, 13]);
  map.clear();
  expect([...map.values()]).toEqual([]);
});
