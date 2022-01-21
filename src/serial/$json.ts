import { $string } from "./$string.ts";
import { Serializer } from "./Serializer.ts";

export const $json = new Serializer<any>({
  s: (value) => $string.s(JSON.stringify(value)),
  *d() {
    return JSON.parse(yield* $string.d());
  },
});
