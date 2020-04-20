
// eslint-disable-next-line @typescript-eslint/class-name-casing
class _Class {}

export const Callable = <Class extends typeof _Class>(Class: Class): Class =>
  // @ts-ignore
  class implements Class {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __f: any;

    constructor(){
      let f = (...a: unknown[]) => this.__f.apply(f, a);
      Class.call(f);
      return Object.setPrototypeOf(f, new.target.prototype);
    }

  }
