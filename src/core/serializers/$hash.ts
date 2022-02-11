import { $string, Serializer } from "../../serial/mod.ts";
import { Hash } from "../utils/mod.ts";

export const $hash: Serializer<Hash<any>> = $string as never;
