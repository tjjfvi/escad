import { snapshot, toError } from "../../testUtils/mod.ts";
import { Id } from "../mod.ts";

Deno.test("Id.create", async (t) => {
  await t.step("@escad/core/Test/test0", async () => {
    await snapshot(
      import.meta.url,
      "idValue",
      Id.create(import.meta.url, "@escad/core", "Test", "test0"),
    );
  });
  await t.step("Throws on duplicate", async () => {
    await snapshot(
      import.meta.url,
      "duplicateError",
      toError(() => Id.create(import.meta.url, "@escad/core", "Test", "test0"))
        .message,
    );
  });
});
