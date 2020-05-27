
import ExtensibleFunction from "./ExtensibleFunction";
import { __Operation__ } from "./Operation";
import { __Element__ } from "./Element";
import Product from "./Product";
import { __Thing__ } from "./__Thing__";

export class __Component__<I extends any[], T extends __Thing__> extends __Thing__ {
  declare private __i__: I;
  declare private __t__: T;
};

interface Component<I extends any[], T extends __Thing__> {
  (...args: I): T;
}

class Component<I extends any[], T extends __Thing__> extends __Component__<I, T> {

  constructor(name: string, func: (...args: I) => T) {
    super((...args) => {
      let x = func(...(args as I));
      return x;
    }, {}, name);
  }

}

export default Component;

