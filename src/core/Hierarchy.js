
const arrayish = require("./arrayish");

class Hierarchy {

  static symbol = Symbol("Hierarchy.symbol");
  static apply = Symbol("Hierarchy.apply");

  constructor(name, children = [], important = false, shas = []){
    if(children.isComponent)
      return new Hierarchy(name, children.tree, important, shas);
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
    this.shas = shas;
    Object.freeze(this);
  }

  clone(...shas){
    return new Hierarchy(this.name, this.children, this.important, shas.length ? shas : this.shas);
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
    return Object.assign(obj instanceof Array ? obj.slice() : { ...obj }, { [Hierarchy.symbol]: this });
  }

  serialize(){
    return JSON.stringify(this);
  }

  static deserialize(str){
    let obj = typeof str === "object" ? str : JSON.parse(str);
    if(!obj) return obj;
    return new Hierarchy(obj.name, obj.children.map(Hierarchy.deserialize), obj.important, obj.shas);
  }

}

module.exports = Hierarchy;
