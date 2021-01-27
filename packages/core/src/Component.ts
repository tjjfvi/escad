
import { Hierarchy } from "./Hierarchy";
import { __Thing__ } from "./__Thing__";

export class __Component__<I extends any[], T extends __Thing__> extends __Thing__ {

  declare protected __i__: I;
  declare protected __t__: T;

}

export interface Component<I extends any[], T extends __Thing__> {
  (...args: I): T,
}

export class Component<I extends any[], T extends __Thing__> extends __Component__<I, T> {

  constructor(name: string, func: (...args: I) => T, overrideHierarchy = true, public hierarchy?: Hierarchy){
    super((...args) => {
      let x = func(...(args as I));
      if(overrideHierarchy)
        x.hierarchy = Hierarchy.create({
          braceType: "(",
          children: [
            this.hierarchy ?? Hierarchy.create({ name }),
            Hierarchy.create({ name: "?" }),
          ],
          output: x.hierarchy,
        })
      return x;
    }, {}, name);
  }

}
