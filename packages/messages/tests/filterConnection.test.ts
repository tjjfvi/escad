
import { filterConnection, noopConnection } from "../src"

test("filterConnection", () => {
  const [_a, b] = noopConnection<unknown>()
  const a = filterConnection(_a, (x): x is number => typeof x === "number")
  const fn = jest.fn()
  a.onMsg(fn)
  b.onMsg(fn)
  a.send(0)
  a.send(1)
  b.send(2)
  b.send("-1")
  a.offMsg(fn)
  b.send(-1)
  expect(fn.mock.calls).toEqual([[0], [1], [2]])
})
