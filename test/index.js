
module.exports = (escad, p) => {
  /* let params = p([
    { key: "size", type: "number", default: 20 },
    { key: "height", type: "number", default: 10 },
  ]);*/
  return escad.cube({s:1,c:[false,false,true]}).add(escad.cube(1))
  // return escad.cube(params.size).translate([0, 0, params.height]).add(escad.cube(1));
}
