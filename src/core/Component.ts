
import ExtensibleFunction from "./ExtensibleFunction";
import Operation from "./Operation";
import Element from "./Element";

type $T = Component<any, any> | Operation<any, any> | Element<any>;

interface Component<I extends any[], T extends $T> {
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

