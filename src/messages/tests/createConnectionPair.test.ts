import { createConnectionPair } from "../mod.ts";

test("", () => {
  const [a, b] = createConnectionPair<number>();
  const fn0 = jest.fn();
  const fn1 = jest.fn();
  const fn2 = jest.fn();
  const fn3 = jest.fn();
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
  expect([fn0, fn1, fn2, fn3].map((f) => f.mock.calls)).toMatchSnapshot();
});
