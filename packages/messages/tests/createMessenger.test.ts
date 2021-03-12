import { createMessenger, MessengerImpl, noopConnection } from "../src"

type TestMessenger = {
  promiseResolve: <T>(value: T) => Promise<T>,
  promiseReject: <T>(value: T) => Promise<void>,
  reallyDumbPromiseResolve: <T>(value: T, count: number) => Promise<T>,
  asyncIterable: (values: number[]) => AsyncIterable<number>,
}

const testMessengerImpl: MessengerImpl<TestMessenger, TestMessenger> = {
  promiseResolve: value => Promise.resolve(value),
  promiseReject: value => Promise.reject(value),
  async *asyncIterable(values){
    for(const value of values) {
      if(value === -1)
        throw new Error("The value was `-1`")
      yield value
    }
  },
  async reallyDumbPromiseResolve(value, count){
    if(count <= 0)
      return value
    return this.req.reallyDumbPromiseResolve(value, count - 1)
  },
}

test("", async () => {
  const [a, b] = noopConnection<unknown>()
  const fn = jest.fn()
  a.onMsg(x => fn("b->a", x))
  b.onMsg(x => fn("a->b", x))
  const msgrA = createMessenger(testMessengerImpl, a)
  const msgrB = createMessenger(testMessengerImpl, b)
  expect(await msgrA.promiseResolve(-1)).toBe(-1)
  expect(msgrA.promiseReject(-1)).rejects.toBe(-1)
  expect(await msgrA.req.promiseResolve(0)).toBe(0)
  expect(msgrA.req.promiseReject(1)).rejects.toBe(1)
  expect(await msgrB.req.promiseResolve(2)).toBe(2)
  for await (const value of msgrA.req.asyncIterable([3, 4, 5]))
    fn(value)
  await expect((async () => {
    for await (const value of msgrA.req.asyncIterable([6, -1, -2]))
      fn(value)
  })()).rejects.toMatchSnapshot()
  expect(await msgrA.reallyDumbPromiseResolve(6, 10)).toBe(6)
  b.send(1234)
  b.send(null)
  b.send({})
  b.send([])
  b.send(["missingno", 1, 2, 3])
  b.send(["call", null, 1, 1])
  b.send(["call", 1, {}, 1])
  b.send(["call", 404, "missingno"])
  expect(fn.mock.calls).toMatchSnapshot()
})
