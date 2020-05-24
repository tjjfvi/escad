
class ExtensibleFunction {

  constructor(func: (...x: any[]) => any) {
    return Object.setPrototypeOf(func, new.target.prototype);
  }

}

export default ExtensibleFunction;
