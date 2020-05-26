
import ExtensibleFunction from "./ExtensibleFunction";
import Operation from "./Operation";
import Element from "./Element";

type $T = Operation<any, any> | Element<any>;

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

