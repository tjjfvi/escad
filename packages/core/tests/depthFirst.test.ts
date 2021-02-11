import { depthFirst, Stack } from "../src";

test("Stack", () => {
  const stack = new Stack<number>([3, 2]);
  stack.push(1).push(0)
  expect(stack.pop()).toEqual(0)
  expect([...stack]).toEqual([1, 2, 3]);
  expect(stack.pop()).toEqual(undefined);
})

test("depthFirst", () => {
  type Node = number | Node[];
  const nodes: Node[] = []
  const tree = [[[[5]], 4], [[3], [2, [1], 0]]];
  depthFirst<Node>([tree], function*(x){
    nodes.push(x);
    yield* x instanceof Array ? x : []
  })
  expect(nodes).toMatchSnapshot();
})
