
export const checkTypeProperty = <T extends { type: string }>(type: T["type"]) =>
  (val: unknown): val is T =>
    (typeof val === "object" || typeof val === "function") &&
    val !== null &&
    val["type" as never] === type
