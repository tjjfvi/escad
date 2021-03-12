
import escad, { Operation, Mesh, Vector3 } from "../src/core";

export default () => {

  const
    trackAngle = 85,
    segmentLength = 45,
    radius = 9,
    wallThickness = 2,
    iterations = 1,
    e = escad;

  const tau = Math.PI * 2;

  const sin = (x: number) => Math.sin(x * tau / 360);
  const cos = (x: number) => Math.cos(x * tau / 360);

  const cylinderLength = segmentLength - radius * 2;

  type Point = readonly [number, number];
  type Line = readonly [Point, Point];
  type Path = readonly Line[];

  const lerp = (b: Point, a: Point, t: number): Point =>
    a.map((A, i) => A * t + b[i] * (1 - t)) as any;

  const reverse = (a: Path): Path => a.slice().reverse().map(x => x.slice().reverse()) as any;

  const mapLine = (l: Line, f: (p: Point) => Point): Line => l.map(f) as any;
  const mapPath = (p: Path, f: (p: Point) => Point): Path => p.map(l => mapLine(l, f));

  const hilbertCurvePath = (iterations = 0): Path => {
    if(iterations === 0)
      return [[[1, 0], [1, 1]], [[0, 0], [1, 0]], [[0, 1], [0, 0]]];
    let size = 2 ** (iterations - 1);
    let curve = hilbertCurvePath(iterations - 1);
    let curveShifted = mapPath(curve, ([x, y]) => [x + size * 2, y]);
    let transposed = mapPath(curve, ([x, y]) => [y + size * 2, x + size * 2]);
    let transposedFlipped = mapPath(curve, ([x, y]) => [size * 2 - 1 - y, x + size * 2]);
    return [
      ...transposed,
      [[size * 4 - 1, size * 2 - 1], [size * 4 - 1, size * 2]],
      ...curveShifted,
      [[size * 2 - 1, size * 2 - 1], [size * 2, size * 2 - 1]],
      ...curve,
      [[0, size * 2], [0, size * 2 - 1]],
      ...reverse(transposedFlipped),
    ];
  };

  const supportHeight = (i: number) => 4 ** (i + 1) * (cos(trackAngle) * segmentLength) + wallThickness * 5;

  const hilbertCurve = (iterations = 0) => new Operation<Mesh, Mesh>("hilbertCurve", children => {
    let curve = hilbertCurvePath(iterations);
    let xy = sin(trackAngle) * -cylinderLength;
    let z = cos(trackAngle) * cylinderLength;

    return curve.map((l, i) => {
      let p = lerp(l[0], l[1], .5);
      let dir = l[0].map((A, i) => A - l[1][i]);
      let rot = dir[1] === 1 ?
        -90 :
        dir[1] === -1 ?
          90 :
          dir[0] === 1 ?
            0 :
            dir[0] === -1 ?
              180 :
              null;
      if(rot === null)
        throw new Error("Weird direction");

      return children.rotateZ(rot).translate([xy * p[0], xy * p[1], z * (curve.length - 1 - i)])
    })
  });

  const track = () => {
    let r = radius + wallThickness;
    let height = supportHeight(iterations);
    let width = sin(trackAngle) * segmentLength + wallThickness * 2;
    let cubeWidth = width - r * 2;
    let dropLength = width - r * 4;
    let dropHeight = cos(trackAngle) * cylinderLength;

    return [
      e.union(
        e.cube({ d: [cubeWidth, r * 2, height] }),
        e.cyl({ r, height: Math.abs(height) }).translate([cubeWidth / 2, 0, 0]),
        e.cyl({ r, height: Math.abs(height) }).translate([-cubeWidth / 2, 0, 0]),
      ).translate([0, 0, -height / 2]).sub(
        e.polyhedron([
          new Vector3(+dropLength / 2, +r + 1, -dropHeight),
          new Vector3(-dropLength / 2, +r + 1, 1),
          new Vector3(+dropLength / 2, -r - 1, -dropHeight),
          new Vector3(-dropLength / 2, -r - 1, 1),
          new Vector3(+width / 2, +r + 1, 1),
          new Vector3(+width / 2, -r - 1, 1),
          new Vector3(+width / 2, +r + 1, -dropHeight),
          new Vector3(+width / 2, -r - 1, -dropHeight),
        ], [
          [4, 6, 0, 1],
          [3, 2, 7, 5],
          [2, 3, 1, 0],
          [4, 5, 7, 6],
          [5, 4, 1, 3],
          [2, 0, 6, 7],
        ]).rotateZ(180),
      ),
      e.union(
        e.cyl({ r: radius, h: cylinderLength }),
        e.sphere({ r: radius, slices: 20 }).translate([0, 0, cylinderLength / 2]),
        e.sphere({ r: radius, slices: 20 }).translate([0, 0, -cylinderLength / 2]),
      ).rotate(0, trackAngle, 0),
    ];
  };

  let size = -radius - wallThickness + (2 ** iterations + .25) * (segmentLength / 2 + wallThickness);

  let pos = e
    .union(hilbertCurve(iterations)(track()[0]))
    .translate([size, size, radius + wallThickness * 2])
    .sub(e.cube({ s: 10000 }).translateZ(-5000))

  let neg = e
    .union(hilbertCurve(iterations)(track()[1]))
    .translate([size, size, radius + wallThickness * 2]);

  return e.diff(pos, neg);

}
