
const { Work, Component, Hierarchy, operators } = require(".");
const { Mesh, Face, Vector3 } = require("./Mesh");
const { _diff } = require("./csg");

class SphereWork extends Work {

  static id="SphereWork";

  execute(){
    let [r, slices, stacks] = this.args;

    let v = (theta, phi) => {
      theta *= Math.tau / slices;
      phi *= Math.tau / stacks;
      phi /= 2;
      return new Vector3(
        Math.sin(theta) * Math.sin(phi) * r,
        Math.cos(theta) * Math.sin(phi) * r,
        Math.cos(phi) * r,
      )
    }
    return new Mesh([...Array(slices)].flatMap((_, i) =>
      [...Array(stacks)].flatMap((_, j) => {
        let vs = [];

        vs.push(v(i, j));
        if(j > 0)
          vs.push(v(i + 1, j));
        if(j < stacks - 1)
          vs.push(v(i + 1, j + 1));
        vs.push(v(i, j + 1));

        return [...Array(vs.length - 2)].map((_, i) => new Face([0, i + 1, i + 2].map(x => vs[x])));
      })
    ));
  }

}

operators.hollowSphere = operators.sphere = ({
  r = 1,
  slices = 16,
  stacks = 8,
  t = r,
  i = r - t, ir = i,
  unionDiff = false, ud = unionDiff,
}) => {
  let os = new SphereWork([], new Hierarchy("sphere"), r, slices, stacks);
  if(!ir)
    return new Component(os);
  let is = new SphereWork([], new Hierarchy("sphere-inner"), i, slices, stacks);
  return new Component(ud ? [os, is] : _diff(os, is));
}

