
import { transformConnection, createConnectionPair } from "../src.ts"

test("", () => {
  const [_a, b] = createConnectionPair<string>()
  const a = transformConnection(_a, x => x + "", x => +x)
  const fn = jest.fn()
  const offMsgA = a.onMsg(fn)
  b.onMsg(fn)
  a.send(0)
  b.send("1")
  offMsgA()
  b.send("-1")
  expect(fn.mock.calls).toEqual([["0"], [1]])
})
