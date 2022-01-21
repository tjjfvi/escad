import { $array } from "./$array.ts";
import { Serializer } from "./Serializer.ts";
import { $string } from "./$string.ts";
import { $tuple } from "./$tuple.ts";

export const $record = <V>($value: Serializer<V>) => {
  const $entries = $array($tuple($string, $value));
  return new Serializer<Record<string, V>>({
    *s(value) {
      const entries = Object.entries(value);
      yield* $entries.s(entries);
    },
    *d() {
      const entries = yield* $entries.d();
      return Object.fromEntries(entries);
    },
  });
};
