
import { Work, Component, Hierarchy, operators, Id } from ".";
import { Mesh, Face } from "./Mesh";
import { Vector3 } from "./Vector3";

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

