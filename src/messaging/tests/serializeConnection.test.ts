import { assertSnapshot, mock } from "../../testing/mod.ts";
import { createConnectionPair, serializeConnection } from "../mod.ts";

Deno.test("serializeConnection", async (t) => {
  const [_a, b] = createConnectionPair<Uint8Array>();
  const a = serializeConnection(_a);
  const fn = mock();
  a.onMsg(fn);
  b.onMsg(fn);
  a.send(0);
  a.send({ a: "abc", b: [1, 2, 3] });
  while (fn.calls.length < 2) {
    await Promise.resolve();
  }
  await assertSnapshot(t, fn.calls);
});
