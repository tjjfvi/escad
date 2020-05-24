
export * from "./builtins";
import * as builtins from "./builtins";
import { Elementish } from "./Element";

export default Object.assign(<T extends builtins.Product>(...a: Elementish<T>[]) =>
  new builtins.Element(a.length === 1 ? a[0] : a), builtins);
