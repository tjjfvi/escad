
export * from "./builtins";
import * as builtins from "./builtins";
import { Elementish } from "./Element";

const escadFunc = <T extends builtins.Product>(...a: Elementish<T>[]) => {
  return new builtins.Element(a.length === 1 ? a[0] : a);
}

const escad = Object.assign(escadFunc, { ...builtins }) as typeof escadFunc & typeof builtins;

export default escad;