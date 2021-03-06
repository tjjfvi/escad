
export const checkTypeProperty =
  <T extends { type: unknown }>(fn: (value: unknown) => value is T["type"]) =>
    (value: unknown): value is T =>
      (typeof value === "object" || typeof value === "function") &&
      value !== null &&
      "type" in value &&
      fn(value["type" as never])

checkTypeProperty.string = <T extends { type: string }>(type: T["type"]) =>
  checkTypeProperty((value): value is T["type"] =>
    value === type
  );

checkTypeProperty.id = <T extends { type: Id }>(id: T["type"]) =>
  checkTypeProperty((value): value is T["type"] =>
    Id.isId(value) &&
    Id.equal(value, id)
  );

checkTypeProperty.idScope =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  <T extends { type: Id }>(scope: T["type"]["scope"]) =>
    checkTypeProperty((value): value is T["type"] =>
      Id.isId(value) &&
      value.scope === scope
    )

import { Id } from "./Id"
