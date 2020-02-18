
module.exports = escad => {

  const
    trackAngle = 85,
    segmentLength = 45,
    radius = 9,
    wallThickness = 2,
    iterations = 1,
    e = escad;

  const sin = x => Math.sin(x * Math.tau / 360);
  const cos = x => Math.cos(x * Math.tau / 360);

  const cylinderLength = segmentLength - radius * 2;

  const lerp = (b, a, t) => a.map((A, i) => A * t + b[i] * (1 - t));

  const reverse = a => a.reverse().map(x => x.reverse());

  const hilbertCurvePath = (iterations = 0) => {
    if(iterations === 0)
      return [[[1, 0], [1, 1]], [[0, 0], [1, 0]], [[0, 1], [0, 0]]];
    let size = 2 ** (iterations - 1);
    let curve = hilbertCurvePath(iterations - 1);
    let curveShifted = curve.map(p => p.map(([x, y]) => [x + size * 2, y]));
    let transposed = curve.map(p => p.map(([x, y]) => [y + size * 2, x + size * 2]));
    let transposedFlipped = curve.map(p => p.map(([x, y]) => [size * 2 - 1 - y, x + size * 2]));
    return [
      transposed,
      [[[size * 4 - 1, size * 2 - 1], [size * 4 - 1, size * 2]]],
      curveShifted,
      [[[size * 2 - 1, size * 2 - 1], [size * 2, size * 2 - 1]]],
      curve,
      [[[0, size * 2], [0, size * 2 - 1]]],
      reverse(transposedFlipped),
    ].flat();
  };

  const supportHeight = i => 4 ** (i + 1) * (cos(trackAngle) * segmentLength) + wallThickness * 5;

  const hilbertCurve = iterations => children => {
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

      return escad(children).rotate(rot).translate([xy * p[0], xy * p[1], z * (curve.length - 1 - i)])
    })
  }

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
          [+dropLength / 2, +r + 1, -dropHeight],
          [-dropLength / 2, +r + 1, 1],
          [+dropLength / 2, -r - 1, -dropHeight],
          [-dropLength / 2, -r - 1, 1],
          [+width / 2, +r + 1, 1],
          [+width / 2, -r - 1, 1],
          [+width / 2, +r + 1, -dropHeight],
          [+width / 2, -r - 1, -dropHeight],
        ], [
          [4, 6, 0, 1],
          [3, 2, 7, 5],
          [2, 3, 1, 0],
          [4, 5, 7, 6],
          [5, 4, 1, 3],
          [2, 0, 6, 7],
        ]).rotate(180)
      ),
      e.union(
        e.cyl({ r: radius, h: cylinderLength }),
        e.sphere({ r: radius, slices: 20 }).translate([0, 0, cylinderLength / 2]),
        e.sphere({ r: radius, slices: 20 }).translate([0, 0, -cylinderLength / 2]),
      ).rotate(0, trackAngle, 0),
    ];
  };

  let size = -radius - wallThickness + (2 ** iterations + .25) * (segmentLength / 2 + wallThickness);

  // return e.diff(track());

  // return hilbertCurve(iterations)(track()[1])

  let pos = e.union(hilbertCurve(iterations)(track()[0])).translate([size, size, radius + wallThickness * 2]);
  pos.subtract(e.cube(10000).translate([0, 0, -5000]));
  let neg = e.union(hilbertCurve(iterations)(track()[1])).translate([size, size, radius + wallThickness * 2]);
  return e.diff(pos, neg);

}
