import { createConnectionPair, serializeConnection } from "../src"

test("", () => {
  const [_a, b] = createConnectionPair<string>()
  const a = serializeConnection(_a)
  const fn = jest.fn()
  a.onMsg(fn)
  b.onMsg(fn)
  a.send(0)
  a.send({ a: "abc", b: [1, 2, 3] })
  b.send("[1]")
  b.send('[{"a":"0"}]')
  expect(fn.mock.calls).toMatchSnapshot()
})
