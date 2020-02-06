
const { Work, Component, operators } = require(".");
const { Mesh, Face, Vector3 } = require("./Mesh");

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

operators.cyl = operators.cylinder = ({
  r = 1, r1 = r, r2 = r,
  l = 1, length = l, h = length, height = h,
  sides = 20,
  offsets = [[0, 0], [0, 0]], os = offsets,
  offset1 = os[0], o1 = offset1,
  offset2 = os[1], o2 = offset2,
  center = true, c = center,
}) => new Component(new CylWork([], r1, r2, height, sides, o1, o2, c))

