
const { Work, Component, Hierarchy, operators } = require(".");
const { Mesh, Face, Vector3 } = require("./Mesh");
const { _diff } = require("./csg");

const { tau } = Math;

class CylWork extends Work {

  static id="CylWork";

  execute(){
    let [r1, r2, height, sides, o1, o2, c] = this.args;

    let bh = c ? -height / 2 : 0;
    let th = bh + height;

    let c1 = [...o1, bh];
    let c2 = [...o2, th];

    return new Mesh([...Array(sides)].flatMap((_, i) => {
      let p1 = [Math.cos(i / sides * tau), Math.sin(i / sides * tau)];
      let p2 = [Math.cos((i + 1) / sides * tau), Math.sin((i + 1) / sides * tau)];
      let p11 = [p1[0] * r1 + o1[0], p1[1] * r1 + o1[1], bh];
      let p12 = [p1[0] * r2 + o2[0], p1[1] * r2 + o2[1], th];
      let p21 = [p2[0] * r1 + o1[0], p2[1] * r1 + o1[1], bh];
      let p22 = [p2[0] * r2 + o2[0], p2[1] * r2 + o2[1], th];
      return [
        [p21, p11, c1],
        [c2, p12, p22],
        [p12, p11, p22],
        [p22, p11, p21]
      ];
    }).map(f => new Face(f.map(v => new Vector3(...v)))));
  }

}

Work.Registry.register(CylWork);

operators.cyl = operators.cylinder = operators.hollowCyl = operators.hollowCylinder = ({
  r = 1, r1 = r, r2 = r,
  t, t1 = t || r1, t2 = t || r2,
  i, i1 = i || r1 - t1, i2 = i || r2 - t2,
  l = 1, length = l, h = length, height = h,
  sides = 20,
  offsets = [[0, 0], [0, 0]], os = offsets,
  offset1 = os[0], o1 = offset1,
  offset2 = os[1], o2 = offset2,
  iOffsets = [o1, o2], ios = iOffsets,
  iOffset1 = ios[0], io1 = iOffset1,
  iOffset2 = ios[1], io2 = iOffset2,
  center = true, c = center,
  unionDiff = false, ud = unionDiff,
}) => {
  let oc = new CylWork([], new Hierarchy("cyl"), r1, r2, height, sides, o1, o2, c);
  if(!i1 && !i2)
    return new Component(oc)
  let ic = new CylWork([], new Hierarchy("cyl-inner"), i1, i2, height, sides, io1, io2, c);
  return new Component(ud ? [oc, ic] : _diff(oc, ic));
}

