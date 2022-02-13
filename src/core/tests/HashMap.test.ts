import { assertEquals } from "../../testing/mod.ts";
import { HashMap } from "../mod.ts";

Deno.test("HashMap", () => {
  const map = new HashMap();
  assertEquals(map.has({ a: 1 }), false);
  assertEquals(map.get({ a: 1 }), undefined);
  map.set({ a: 1 }, 5);
  assertEquals(map.has({ a: 1 }), true);
  assertEquals(map.get({ a: 1 }), 5);
  map.clear();
  assertEquals(map.has({ a: 1 }), false);
  assertEquals(map.get({ a: 1 }), undefined);
  map.set({ a: 1 }, "x");
  map.set({ a: 1 }, "x");
  map.set({ b: 1 }, "42");
  assertEquals(map.get({ a: 1 }), "x");
  assertEquals(map.get({ b: 1 }), "42");
  assertEquals(map.size, 2);
  assertEquals([...map.values()], ["x", "42"]);
  map.delete({ b: 1 });
  assertEquals(map.get({ b: 1 }), undefined);
  assertEquals(map.size, 1);
});
