const map = new WeakMap<ExtensibleFunction, typeof ExtensibleFunction>();

export class ExtensibleFunction extends Function {
  // eslint-disable
  // @ts-ignore
  constructor(
    func: (...x: any[]) => any,
    handler: ProxyHandler<any> = {},
    name = "",
  ) {
    const that = Object.setPrototypeOf(
      {
        [name]: function (...a: any[]) {
          return func.call(this, ...a);
        },
      }[name],
      new Proxy(new.target.prototype, handler),
    );
    map.set(that, new.target);
    return that;
  }
}

Object.defineProperty(ExtensibleFunction, Symbol.hasInstance, {
  value: function (this: typeof ExtensibleFunction, inst: any) {
    let Class = map.get(inst);
    if (!Class) return false;
    return Class.prototype === this.prototype;
  },
});
