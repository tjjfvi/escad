import { assertEquals, mock } from "../../testing/mod.ts";
import { brandConnection, createConnectionPair } from "../mod.ts";

Deno.test("brandConnection", () => {
  const [_a, b] = createConnectionPair();
  const a = brandConnection(_a, "testBrand");
  const fn = mock();
  a.onMsg(fn);
  b.onMsg(fn);
  a.send(0);
  b.send(-1);
  b.send(null);
  b.send({});
  b.send({ brand: {} });
  b.send({ value: -1 });
  b.send({ brand: "wrong", value: -1 });
  b.send({ brand: "testBrand", value: 1 });
  assertEquals(fn.calls, [[{ brand: "testBrand", value: 0 }], [1]]);
});
