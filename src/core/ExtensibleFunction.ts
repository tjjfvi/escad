// @flow

class ExtensibleFunction {

  constructor(func: any){
    // $FlowFixMe
    return Object.setPrototypeOf(func, new.target.prototype);
  }

}

export default ExtensibleFunction;
