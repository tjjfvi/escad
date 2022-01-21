
import { brandConnection, createConnectionPair } from "../src.ts"

test("", () => {
  const [_a, b] = createConnectionPair()
  const a = brandConnection(_a, "testBrand")
  const fn = jest.fn()
  a.onMsg(fn)
  b.onMsg(fn)
  a.send(0)
  b.send(-1)
  b.send(null)
  b.send({})
  b.send({ brand: {} })
  b.send({ value: -1 })
  b.send({ brand: "wrong", value: -1 })
  b.send({ brand: "testBrand", value: 1 })
  expect(fn.mock.calls).toEqual([[{ brand: "testBrand", value: 0 }], [1]])
})
