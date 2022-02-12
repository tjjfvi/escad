import { assertEquals } from "../../testing/mod.ts";
import { MultiHashMap } from "../mod.ts";

Deno.test("MultiHashMap", () => {
  const map = new MultiHashMap();
  assertEquals(map.hasAny({ a: 1 }), false);
  map.add({ a: 1 }, 5);
  assertEquals(map.has({ a: 1 }, 5), true);
  assertEquals(map.has({ a: 1 }, 7), false);
  assertEquals(map.hasAny({ a: 1 }), true);
  assertEquals([...map.getAll({ a: 1 })], [5]);
  map.add({ a: 1 }, 7);
  assertEquals([...map.getAll({ a: 1 })], [5, 7]);
  map.delete({ a: 1 }, 7);
  assertEquals([...map.getAll({ a: 1 })], [5]);
  map.deleteAll({ a: 1 });
  assertEquals([...map.getAll({ a: 1 })], []);
  map.add({ a: 1 }, 10);
  map.add({ b: 1 }, 12);
  map.add({ b: 1 }, 12);
  map.add({ b: 1 }, 13);
  assertEquals([...map.values()], [10, 12, 13]);
  map.clear();
  assertEquals([...map.values()], []);
});
