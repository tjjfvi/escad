import { ConvertibleTo, escad } from "../packages/core.ts";
import "../packages/3d/register";
import { Mesh } from "../packages/csg/node_modules/@escad/3d/dist.ts";
import { smoothContext } from "../packages/3d/node_modules/@escad/3d/dist/smoothContext.ts";

export default () => {
  smoothContext.set({ sides: 12 });
  const c = escad<ConvertibleTo<Mesh>>([
    [
      escad.cyl({ radius: 1, height: 20 }),
      escad.sphere({ radius: 2 }).translate([0, 0, 5]),
      escad.sphere({ radius: 2 }).translate([0, 0, -5]),
    ],
    [
      escad.cyl({ radius: .8, height: 20 }),
      escad.sphere({ radius: 1.8 }).translate([0, 0, 5]),
      escad.sphere({ radius: 1.8 }).translate([0, 0, -5]),
    ],
  ]);
  return escad.unionDiff({
    x: c.rotate(0, 90, 0),
    y: c.rotate(90, 0, 0),
    z: c,
  });
};
