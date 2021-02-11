
import { mapConnection, noopConnection } from ".."

test("mapConnection", () => {
  const [_a, b] = noopConnection<string>();
  const a = mapConnection<string, number>(_a, x => x + "", x => +x);
  const fn = jest.fn();
  a.onMsg(fn);
  b.onMsg(fn);
  a.send(0);
  b.send("1");
  a.offMsg(fn);
  b.send("-1");
  expect(fn.mock.calls).toEqual([["0"], [1]]);
})

test("json", () => {
  const [_a, b] = noopConnection<string>();
  const a = mapConnection.json(_a);
  const fn = jest.fn();
  a.onMsg(fn);
  b.onMsg(fn);
  a.send(0);
  a.send({ a: "abc", b: [1, 2, 3] });
  b.send("1");
  b.send('{ "x": "xyz", "y": [9, 8, 7] }');
  expect(fn.mock.calls).toEqual([
    ["0"],
    ['{"a":"abc","b":[1,2,3]}'],
    [1],
    [{ x: "xyz", y: [9, 8, 7] }],
  ])
})

test("flatted", () => {
  const [_a, b] = noopConnection<string>();
  const a = mapConnection.flatted(_a);
  const fn = jest.fn();
  a.onMsg(fn);
  b.onMsg(fn);
  a.send(0);
  a.send({ a: "abc", b: [1, 2, 3] });
  b.send("[1]");
  b.send('[{"a":"0"}]');
  expect(fn.mock.calls).toMatchSnapshot();
})
