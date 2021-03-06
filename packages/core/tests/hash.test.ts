
import { Hash } from "../src";

test("", () => {
  expect([
    10,
    null,
    [1, 2, 3],
    { a: 1 },
  ].map(Hash.create)).toMatchSnapshot()
})
