import { assertEquals } from "../../testing/mod.ts";
import { ContextStack, Id } from "../mod.ts";

const idA = Id.create(import.meta.url, "@escad/core", "Test", "ContextA");
const idB = Id.create(import.meta.url, "@escad/core", "Test", "ContextB");

Deno.test("ContextStack", () => {
  const stack = new ContextStack();

  assertEquals(stack.get(idA), undefined);
  assertEquals(stack.get(idB), undefined);
  stack.set(idA, "A0");
  assertEquals(stack.get(idA), "A0");
  assertEquals(stack.get(idB), undefined);
  stack.wrap(() => {
    assertEquals(stack.get(idA), "A0");
    assertEquals(stack.get(idB), undefined);
    stack.set(idA, "A1");
    stack.set(idB, "B0");
    assertEquals(stack.get(idA), "A1");
    assertEquals(stack.get(idB), "B0");
  });
  assertEquals(stack.get(idA), "A0");
  assertEquals(stack.get(idB), undefined);
});
