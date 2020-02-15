
const arrayish = require("./arrayish");

class Hierarchy {

  static symbol = Symbol("Hierarchy.symbol");
  static apply = Symbol("Hierarchy.apply");

  constructor(name, children = [], important = false, sha = null){
    if(children.isComponent)
      return new Hierarchy(name, children.tree, important, sha);
    this.name = name;
    this.important = important;
    this.children = children && Hierarchy.symbol in children ?
      [children[Hierarchy.symbol]] :
      arrayish.toArray(children, (v, k) => {
        let f = v =>
          typeof k === "string" ?
            new Hierarchy(k, [v], true) :
            v instanceof Hierarchy ?
              v :
              v && (Hierarchy.symbol in v) ?
                v[Hierarchy.symbol] :
                v.isComponent ?
                  f(v.tree) :
                  arrayish.isArrayish(v) ?
                    new Hierarchy(k, v, false) :
                    null
        let val = f(v);
        return val;
      });
    this.sha = sha;
    Object.freeze(this);
  }

  clone(sha = this.sha){
    return new Hierarchy(this.name, this.children, this.important, sha);
  }

  log(indent = 0){
    console.log("  ".repeat(indent) + (this.important ? "*" : "-"), this.name);
    this.children.map(c => c.log(indent + 1));
  }

  apply(obj){
    if(!obj)
      return obj;
    if(Hierarchy.apply in obj)
      return obj[Hierarchy.apply](this);
    return { ...obj, [Hierarchy.symbol]: this };
  }

}

module.exports = Hierarchy;
