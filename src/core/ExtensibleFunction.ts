
class ExtensibleFunction {

  constructor(func: (...x: any[]) => any, public readonly name = "") {
    return Object.setPrototypeOf(func, new.target.prototype);
  }

}

export default ExtensibleFunction;
