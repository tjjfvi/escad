import { assertEquals, mock, snapshot } from "../../testUtils/mod.ts";
import {
  Connection,
  createConnectionPair,
  createMessenger,
  Messenger,
} from "../mod.ts";

type TestShape = {
  promiseResolve: <T>(value: T) => Promise<T>;
  bouncingPromiseResolve: <T>(value: T, count: number) => Promise<T>;
};

type TestEvents = {
  promiseResolveBounced: [value: unknown, count: number];
};

type TestMessenger = Messenger<TestShape, TestShape, TestEvents>;

const createTestMessenger = (connection: Connection<unknown>) => {
  const messenger: TestMessenger = createMessenger({
    impl: {
      promiseResolve: (value) => Promise.resolve(value),
      async bouncingPromiseResolve(value, count) {
        if (count === 0) {
          return value;
        }
        messenger.emit("promiseResolveBounced", value, count);
        return messenger.bouncingPromiseResolve(value, count - 1);
      },
    },
    connection,
  });
  return messenger;
};

Deno.test("createMessenger", async () => {
  const [a, b] = createConnectionPair();
  const fn = mock();
  a.onMsg((x) => fn("b->a", x));
  b.onMsg((x) => fn("a->b", x));
  const msgrA = createTestMessenger(a);
  const msgrB = createTestMessenger(b);
  assertEquals(await msgrA.promiseResolve(-1), -1);
  assertEquals(await msgrA.promiseResolve(0), 0);
  assertEquals(await msgrB.promiseResolve(1), 1);
  const eventFn1 = mock();
  const eventFn2 = mock();
  const eventFn3 = mock();
  const eventFn4 = mock();
  msgrA.on("promiseResolveBounced", eventFn1);
  msgrB.on("promiseResolveBounced", eventFn2);
  msgrB.once("promiseResolveBounced", eventFn3);
  (async () => {
    for await (const event of msgrA.on("promiseResolveBounced")) {
      eventFn4(event);
    }
  })();
  let p = msgrA.once("promiseResolveBounced").then((x) =>
    assertEquals(x, [
      2,
      10,
    ])
  );
  assertEquals(await msgrA.bouncingPromiseResolve(2, 10), 2);
  await p;
  assertEquals(eventFn1.calls.length, 10);
  assertEquals(eventFn2.calls.length, 10);
  assertEquals(eventFn3.calls.length, 1);
  assertEquals(eventFn4.calls.length, 10);
  b.send(1234);
  b.send(null);
  b.send({});
  b.send([]);
  b.send(["missingno", 1, 2, 3]);
  b.send(["call", null, 1, 1]);
  b.send(["call", 1, {}, 1]);
  await snapshot(import.meta.url, "", fn.calls);
});
