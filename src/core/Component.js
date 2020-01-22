
const chainables = require("./chainables");

class Component {

  constructor(tree){
    let that = Object.setPrototypeOf((...args) => {
      if(args.length)
        that.tree = args[0];
      return that;
    }, proto);

    that.tree = tree;
    that.isComponent = true;

    return that;
  }

  clone(){
    return new Component(this.tree);
  }

  process(){
    return this.tree.process();
  }

}

const proto = new Proxy(Component.prototype, {
  get: (target, prop) =>
    prop in target ?
      target[prop] :
      prop in chainables ?
        function(...args){
          return chainables[prop](this, ...args);
        } :
        undefined
});

module.exports = Component;
