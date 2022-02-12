import {
  defaultChainables,
  extendChainables,
  pickChainables,
  Realm,
} from "./chaining/mod.ts";

import * as _chainables from "./chainables/mod.ts";
const chainables = pickChainables(_chainables);
export default chainables;
type Chainables = typeof chainables;
declare global {
  export namespace escad {
    export interface DefaultChainables extends Chainables {}
  }
}
extendChainables(chainables);

export const escad = Realm.create(() => defaultChainables);

// moderate

export * from "./artifacts/mod.ts";
export * from "./chainables/mod.ts";
export * from "./chaining/mod.ts";
export * from "./conversions/mod.ts";
export * from "./exports/mod.ts";
export * from "./hierarchy/mod.ts";
export * from "./logs/mod.ts";
export * from "./parameters/mod.ts";
export * from "./product/mod.ts";
export * from "./serializers/mod.ts";
export * from "./utils/mod.ts";
