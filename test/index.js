
module.exports = (escad, p) => {
  p;
  let x = escad.cyl({ r: 1, t: .2, h: 10, sides: 12, ud: true });
  return escad.unionDiff({
    x: escad(x).rotate(0, 90, 0),
    y: escad(x).rotate(90, 0, 0),
    z: escad(x),
    ball: escad.sphere({ r: 2.5, t: .2, ud: true, slices: 64, stacks: 32 }),
  });
};
