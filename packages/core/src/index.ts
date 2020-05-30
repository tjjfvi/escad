
export * from "./builtins";
import * as builtins from "./builtins";
import Element, { Elementish } from "./Element";
import Product from "./Product";

const escadFunc = <T extends Product>(...a: Elementish<T>[]) => {
  return new Element(a.length === 1 ? a[0] : a);
}

const escad = Object.assign(escadFunc, { ...builtins }) as typeof escadFunc & typeof builtins;

export default escad;