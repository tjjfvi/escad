
import { filterConnection, createConnectionPair } from "../src.ts"

test("", () => {
  const [_a, b] = createConnectionPair()
  const a = filterConnection(_a, (x): x is number => typeof x === "number")
  const fn = jest.fn()
  const offMsgA = a.onMsg(fn)
  b.onMsg(fn)
  a.send(0)
  a.send(1)
  b.send(2)
  b.send("-1")
  offMsgA()
  b.send(-1)
  expect(fn.mock.calls).toEqual([[0], [1], [2]])
})
