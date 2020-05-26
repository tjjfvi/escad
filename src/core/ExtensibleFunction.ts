
const map = new WeakMap<ExtensibleFunction, typeof ExtensibleFunction>();

class ExtensibleFunction {

  constructor(func: (...x: any[]) => any, handler: ProxyHandler<any> = {}, public readonly name = "") {
    Object.setPrototypeOf(func, new Proxy(new.target.prototype, handler));
    map.set(func, new.target);
    return func;
  }

}
Object.defineProperty(ExtensibleFunction, Symbol.hasInstance, {
  value: function (this: typeof ExtensibleFunction, inst: any) {
    let Class = map.get(inst);
    console.log(inst, Class?.prototype, this.prototype)
    if (!Class) return false;
    return Class.prototype === this.prototype;
  }
});


export default ExtensibleFunction;
