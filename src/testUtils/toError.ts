import { AssertionError } from "./assert.ts";

export function toError(fn: () => any): any {
  try {
    fn();
  } catch (e) {
    return e;
  }
  throw new AssertionError("Function did not throw");
}
