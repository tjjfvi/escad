import { Connection, createMessenger, Messenger, createConnectionPair } from "../src"

type TestShape = {
  promiseResolve: <T>(value: T) => Promise<T>,
  reallyDumbPromiseResolve: <T>(value: T, count: number) => Promise<T>,
}

type TestEvents = {
  heyWereHavingAReallyDumbPromiseResolveParty: [value: unknown, count: number],
}

type TestMessenger = Messenger<TestShape, TestShape, TestEvents>

const createTestMessenger = (connection: Connection<unknown>) => {
  const messenger: TestMessenger = createMessenger({
    impl: {
      promiseResolve: value => Promise.resolve(value),
      async reallyDumbPromiseResolve(value, count){
        messenger.emit("heyWereHavingAReallyDumbPromiseResolveParty", value, count)
        if(count <= 0)
          return value
        return messenger.reallyDumbPromiseResolve(value, count - 1)
      },
    },
    connection,
  })
  return messenger
}

test("", async () => {
  const [a, b] = createConnectionPair()
  const fn = jest.fn()
  a.onMsg(x => fn("b->a", x))
  b.onMsg(x => fn("a->b", x))
  const msgrA = createTestMessenger(a)
  const msgrB = createTestMessenger(b)
  expect(await msgrA.promiseResolve(-1)).toBe(-1)
  expect(await msgrA.promiseResolve(0)).toBe(0)
  expect(await msgrB.promiseResolve(1)).toBe(1)
  const eventFn1 = jest.fn()
  const eventFn2 = jest.fn()
  const eventFn3 = jest.fn()
  const eventFn4 = jest.fn()
  msgrA.on("heyWereHavingAReallyDumbPromiseResolveParty", eventFn1)
  msgrB.on("heyWereHavingAReallyDumbPromiseResolveParty", eventFn2)
  msgrB.once("heyWereHavingAReallyDumbPromiseResolveParty", eventFn3)
  ;(async () => {
    for await (const event of msgrA.on("heyWereHavingAReallyDumbPromiseResolveParty"))
      eventFn4(event)
  })()
  expect(msgrA.once("heyWereHavingAReallyDumbPromiseResolveParty")).resolves.toStrictEqual([2, 10])
  expect(await msgrA.reallyDumbPromiseResolve(2, 10)).toBe(2)
  expect(eventFn1).toHaveBeenCalledTimes(11)
  expect(eventFn2).toHaveBeenCalledTimes(11)
  expect(eventFn3).toHaveBeenCalledTimes(1)
  expect(eventFn4).toHaveBeenCalledTimes(11)
  b.send(1234)
  b.send(null)
  b.send({})
  b.send([])
  b.send(["missingno", 1, 2, 3])
  b.send(["call", null, 1, 1])
  b.send(["call", 1, {}, 1])
  expect(fn.mock.calls).toMatchSnapshot()
})
