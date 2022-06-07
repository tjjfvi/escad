import { assertSnapshot, toError } from "../../testing/mod.ts";
import { Id } from "../mod.ts";

Deno.test("Id.create", async (t) => {
  await t.step("@escad/core/Test/test0", async (t) => {
    await assertSnapshot(
      t,
      Id.create(import.meta.url, "@escad/core", "Test", "test0"),
    );
  });
  await t.step("Throws on duplicate", async (t) => {
    await assertSnapshot(
      t,
      toError(() => Id.create(import.meta.url, "@escad/core", "Test", "test0"))
        .message,
    );
  });
});
