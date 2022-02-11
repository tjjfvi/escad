import { $unknown, Serializer } from "../../serial/mod.ts";
import { WrappedValue } from "../artifacts/mod.ts";

export const $wrappedValue = new Serializer<WrappedValue>({
  s: ({ value }) => $unknown.s(value),
  *d() {
    const value = yield* $unknown.d();
    return WrappedValue.create(value);
  },
});
