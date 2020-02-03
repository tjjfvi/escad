
module.exports = (escad, p) => {
  let params = p([
    { key: "size", type: "number", default: 20 },
    { key: "height", type: "number", default: 10 },
  ]);
  console.log(params);
  return escad.cube(params.size).translate([0, 0, params.height]);
}
