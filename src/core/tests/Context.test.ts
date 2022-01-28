import { Context, ContextStack, Id } from "../mod.ts";
import { assertEquals } from "../../testUtils/mod.ts";

const id = Id.create(import.meta.url, "@escad/core", "Context", "test");

Deno.test("Context", () => {
  const contextStack = new ContextStack();
  const context = new Context(id, "0", contextStack);
  assertEquals(context.get(), "0");
  context.set("1");
  assertEquals(context.get(), "1");
  context.wrap("2", () => {
    assertEquals(context.get(), "2");
    context.set("3");
    assertEquals(context.get(), "3");
  });
  assertEquals(context.get(), "1");
});
