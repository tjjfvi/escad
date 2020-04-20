// @flow

import ExtensibleFunction from "./ExtensibleFunction";
import Operation from "./Operation";
import Element from "./Element";

type $T = Component<any, any> | Operation<any, any> | Element<any>;
const _Component = {
  Component: class <I: Iterable<any>, T: $T> extends ExtensibleFunction {

    name: string;

    #func: (...args: I) => T;

    constructor(name: string, func: (...args: I) => T){
      super((...args) => func(...(args: I)));
      this.name = name;
      this.#func = func;
    }

  }
}.Component;

const Component = (() => {
  declare class Component<I: Iterable<any>, T: $T> extends _Component<I, T> {

    (...args: I): T

  }
  return ((_Component: any): typeof Component);
})();

export default Component;

