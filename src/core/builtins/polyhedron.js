
const { Work, Component, Hierarchy, operators, Id } = require(".");
const { Mesh, Face, Vector3 } = require("./Mesh");

class PolyhedronWork extends Work {

  static id = new Id("PolyhedronWork", __filename);

  execute(){
    let [p, fs] = this.args;

    p = p.map(p => new Vector3(p));

    return new Mesh(fs.flatMap(f => f.slice(2).map((_, i) => new Face([p[f[0]], p[f[i + 1]], p[f[i + 2]]]))));
  }

}

Work.Registry.register(PolyhedronWork);

operators.polyhedron = (points, faces) =>
  new Component(new PolyhedronWork([], new Hierarchy("polyhedron"), points, faces))

