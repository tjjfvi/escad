export let restore = () => {};

if (!("__proto__" in Object.prototype)) {
  Object.defineProperty(Object.prototype, "__proto__", {
    configurable: true,
    enumerable: false,
    get: function () {
      return Object.getPrototypeOf(this);
    },
    set: function (value) {
      Object.setPrototypeOf(this, value);
    },
  });
  // @ts-ignore
  restore = () => delete Object.prototype.__proto__;
}
