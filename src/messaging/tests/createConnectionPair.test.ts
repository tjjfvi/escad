import { mock, snapshot } from "../../testing/mod.ts";
import { createConnectionPair } from "../mod.ts";

Deno.test("createConnectionPair", async () => {
  const [a, b] = createConnectionPair<number>();
  const fn0 = mock();
  const fn1 = mock();
  const fn2 = mock();
  const fn3 = mock();
  a.send(-1);
  const offMsgA = a.onMsg(fn0);
  a.send(-1);
  b.send(0);
  const offMsgB = b.onMsg(fn1);
  a.send(1);
  b.onMsg(fn2);
  a.send(2);
  a.onMsg(fn3);
  b.onMsg(fn3);
  a.send(3);
  b.send(4);
  offMsgA();
  b.send(5);
  offMsgB();
  a.send(6);
  await snapshot(
    import.meta.url,
    "",
    [fn0, fn1, fn2, fn3].map((f) => f.calls),
  );
});
