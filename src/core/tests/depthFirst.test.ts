import { assertEquals, snapshot } from "../../testing/mod.ts";
import { depthFirst, Stack } from "../mod.ts";

Deno.test("Stack", () => {
  const stack = new Stack<number>([3, 2]);
  stack.push(1).push(0);
  assertEquals(stack.pop(), 0);
  assertEquals([...stack], [1, 2, 3]);
  assertEquals(stack.pop(), undefined);
});

Deno.test("depthFirst", async () => {
  type Node = number | Node[];
  const nodes: Node[] = [];
  const tree = [[[[5]], 4], [[3], [2, [1], 0]]];
  depthFirst<Node>([tree], function* (x) {
    nodes.push(x);
    yield* x instanceof Array ? x : [];
  });
  await snapshot(import.meta.url, "depthFirst", nodes);
});
