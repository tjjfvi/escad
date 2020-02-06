
module.exports = (escad, p) => {
  p;
  /* let params = p([
    { key: "size", type: "number", default: 20 },
    { key: "height", type: "number", default: 10 },
  ]);*/
  let a = escad.cube(1);
  let a2 = escad.cube(1);
  let b = escad.cube({ s: 1, c: [false, false, true] });
  let c = escad.cube({ s: 2 }).translate([-1, -1, -1]);

  // return escad.union(a,b).sub(escad.intersection(a,b));
  // let c = a.add(b);
  // let d= a.intersect(b);

  return a.add(c).sub(a2);
  // return escad.cube(params.size).translate([0, 0, params.height]).add(escad.cube(1));
};
