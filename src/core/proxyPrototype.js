
const proxyPrototype = (Target, handler, staticHandler = {}) => {
  let proto = new Proxy(Target.prototype, handler);
  return new Proxy(Target, {
    ...staticHandler,
    construct: function(...args){
      let obj = new Target(...args);

      Object.setPrototypeOf(obj, proto);

      return obj;
    }
  })
}

export default proxyPrototype;
