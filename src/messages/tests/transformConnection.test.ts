import { createConnectionPair, transformConnection } from "../mod.ts";
import { assertEquals, mock } from "../../testUtils/mod.ts";

Deno.test("transformConnection", () => {
  const [_a, b] = createConnectionPair<string>();
  const a = transformConnection(_a, (x) => x + "", (x) => +x);
  const fn = mock();
  const offMsgA = a.onMsg(fn);
  b.onMsg(fn);
  a.send(0);
  b.send("1");
  offMsgA();
  b.send("-1");
  assertEquals(fn.calls, [["0"], [1]]);
});
