
import ExtensibleFunction from "./ExtensibleFunction";
import { __Operation__ } from "./Operation";
import { __Element__ } from "./Element";

type $T = __Operation__<any, any> | __Element__<any>;

export declare class __Component__<I extends any[], T extends $T> { private __i__: I; private __t__: T; };

interface Component<I extends any[], T extends $T> extends __Component__<I, T> {
  (...args: I): T;
}

class Component<I extends any[], T extends $T> extends ExtensibleFunction {

  private func: (...args: I) => T;

  constructor(name: string, func: (...args: I) => T) {
    super((...args) => {
      let x = func(...(args as I));
      console.log(x);
      return x;
    }, {}, name);
    this.func = func;
  }

}

export default Component;

