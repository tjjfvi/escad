import escad from "../src/core";

export default () => {
  let c = escad.udMeld([
    escad.cyl({ r: 1, i: .8, h: 20, sides: 12, ud: true }),
    escad.sphere({ r: 2, i: 1.8, ud: true, slices: 24, stacks: 12 }).translate([0, 0, 5]),
    escad.sphere({ r: 2, i: 1.8, ud: true, slices: 24, stacks: 12 }).translate([0, 0, -5]),
  ]);
  return escad.unionDiff({
    x: escad(c).rotate(0, 90, 0),
    y: escad(c).rotate(90, 0, 0),
    z: c,
  })
}
