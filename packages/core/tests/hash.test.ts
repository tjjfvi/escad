
import { hash } from "../src";

test("", () => {
  expect([
    10,
    null,
    [1, 2, 3],
    { a: 1 },
  ].map(hash)).toMatchSnapshot()
})
