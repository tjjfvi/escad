
module.exports = (escad, p) => {
  p;
  let x = [escad.cyl({ r: 1, h: 10, sides: 12 }), escad.cyl({ r: .8, h: 10, sides: 12 })];
  return escad.unionDiff({
    x: escad(x).rotate(0, 90, 0),
    y: escad(x).rotate(90, 0, 0),
    z: escad(x),
  });
};
