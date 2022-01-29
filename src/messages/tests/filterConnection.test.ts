import { assertEquals, mock } from "../../testUtils/mod.ts";
import { createConnectionPair, filterConnection } from "../mod.ts";

Deno.test("filterConnection", () => {
  const [_a, b] = createConnectionPair();
  const a = filterConnection(_a, (x): x is number => typeof x === "number");
  const fn = mock();
  const offMsgA = a.onMsg(fn);
  b.onMsg(fn);
  a.send(0);
  a.send(1);
  b.send(2);
  b.send("-1");
  offMsgA();
  b.send(-1);
  assertEquals(fn.calls, [[0], [1], [2]]);
});
