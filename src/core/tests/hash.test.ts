import { assertEquals, snapshot } from "../../testUtils/mod.ts";
import { Hash } from "../mod.ts";

Deno.test("Hash.create", async () => {
  await snapshot(
    import.meta.url,
    "create",
    [
      10,
      null,
      [1, 2, 3],
      { a: 1 },
    ].map(Hash.create),
  );
});

Deno.test("Hash.equal", () => {
  const obj = {};
  assertEquals(Hash.equal(obj, obj), true);
  assertEquals(Hash.equal(null, null), true);
  assertEquals(Hash.equal(0, 0), true);
  assertEquals(Hash.equal({}, {}), true);
  assertEquals(Hash.equal("abc", "abc"), true);

  assertEquals(Hash.equal(1, 2), false);
  assertEquals(Hash.equal(3, {}), false);
  assertEquals(Hash.equal("abc", "def"), false);
  assertEquals(Hash.equal("1", 1), false);
  assertEquals(Hash.equal({ type: "a" }, { type: "b" }), false);
  assertEquals(Hash.equal({ x: 1 }, {}), false);
  assertEquals(Hash.equal({ x: 1 }, { x: 2 }), false);
  assertEquals(Hash.equal({ x: 1 }, null), false);
  assertEquals(Hash.equal({ a: undefined }, {}), false);
  assertEquals(Hash.equal(undefined, null), false);
});

Deno.test("Hash.check", () => {
  assertEquals(Hash.check(Hash.create(1), 2), false);
  assertEquals(Hash.check(Hash.create(1), 1), true);
});
