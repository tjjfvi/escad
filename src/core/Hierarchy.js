
const arrayish = require("./arrayish");
const Work = require("./Work");

class Hierarchy {

  constructor(name, children = [], important = false, sha = null){
    this.name = name;
    this.important = important;
    this.children = arrayish.toArray(children, (v, k) =>
      typeof k === "string" ?
        new Hierarchy(k, [v], true) :
        arrayish.isArrayish(v) ?
          new Hierarchy(k, v, false) :
          v instanceof Hierarchy ?
            v :
            v instanceof Work ?
              v.hierarchy :
              null
    );
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

}

module.exports = Hierarchy;
