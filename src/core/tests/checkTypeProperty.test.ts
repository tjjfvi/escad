import { assertEquals } from "../../testUtils/mod.ts";
import { checkTypeProperty, Id } from "../mod.ts";

Deno.test("checkTypeProperty", async (t) => {
  const fnTrue = checkTypeProperty((_v): _v is unknown => true);
  const fnFalse = checkTypeProperty((_v): _v is never => false);

  await t.step("Doesn't match non-object", () => {
    assertEquals(fnTrue(5), false);
    assertEquals(fnTrue("string"), false);
    assertEquals(fnTrue(undefined), false);
  });

  await t.step("Doesn't match null", () => {
    assertEquals(fnTrue(null), false);
  });

  await t.step("Doesn't match missing `type` property", () => {
    assertEquals(fnTrue({}), false);
    assertEquals(fnTrue(() => {}), false);
  });

  await t.step("Matches valid `type` property", () => {
    assertEquals(fnTrue({ type: "whatever" }), true);
    assertEquals(fnTrue(Object.assign(() => {}, { type: "whatever" })), true);
  });

  await t.step("Doesn't match invalid `type` property", () => {
    assertEquals(fnFalse({ type: "whatever" }), false);
    assertEquals(fnFalse(Object.assign(() => {}, { type: "whatever" })), false);
  });
});

Deno.test("checkTypeProperty.string", () => {
  assertEquals(checkTypeProperty.string("test")({ type: "test" }), true);
  assertEquals(checkTypeProperty.string("test")({ type: "wrong" }), false);
});

Deno.test("checkTypeProperty.id", () => {
  const testId = Id.create(import.meta.url, "@escad/core", "Test", "ctpi");
  const wrongId = Id.create(import.meta.url, "@escad/core", "Test", "ctpiw");
  assertEquals(checkTypeProperty.id(testId)({ type: testId }), true);
  assertEquals(checkTypeProperty.id(testId)({ type: "wrong" }), false);
  assertEquals(checkTypeProperty.id(testId)({ type: wrongId }), false);
});

Deno.test("checkTypeProperty.idScope", () => {
  const testId = Id.create(import.meta.url, "@escad/core", "Test", "ctpis");
  const wrongId = Id.create(import.meta.url, "@escad/core", "Wrong", "ctpis");
  assertEquals(checkTypeProperty.idScope("Test")({ type: testId }), true);
  assertEquals(checkTypeProperty.idScope("Test")({ type: "wrong" }), false);
  assertEquals(checkTypeProperty.idScope("Test")({ type: wrongId }), false);
});
