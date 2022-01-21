import { inspect } from "util.ts";

export function assertNever(
  value: never,
  message: (str: string) => string = (str) => `Expected never, got ${str}`,
): never {
  throw new Error(message(inspect(value)));
}
