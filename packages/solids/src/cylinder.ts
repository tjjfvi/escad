
import { Mesh, Face, Vector3 } from "@escad/mesh";
import {
  Conversion,
  createLeafProductUtils,
  Element,
  Id,
  LeafProduct,
  conversionRegistry,
  Component,
  LeafElement,
} from "@escad/core";
import { interpretTriplet, Triplet } from "./helpers";

const tau = Math.PI * 2;

const cylinderId = Id.create(__filename, "@escad/solids", "0", "Cylinder");

export interface Cylinder extends LeafProduct {
  readonly type: typeof cylinderId,
  readonly radius: number,
  readonly height: number,
  readonly smooth: number,
  readonly centering: Vector3,
}

export const Cylinder = {
  create: (radius: number, height: number, smooth: number, centering: Vector3): Cylinder => ({
    type: cylinderId,
    radius,
    height,
    smooth,
    centering,
  }),
  ...createLeafProductUtils<Cylinder, "Cylinder">(cylinderId, "Cylinder"),
  id: cylinderId,
};

declare global {
  namespace escad {
    interface ConversionsObj {
      "@escad/solids/cylinder": {
        cylinderToMesh: Conversion<Cylinder, Mesh>,
      },
    }
  }
}

conversionRegistry.register({
  fromType: Cylinder.productType,
  toType: Mesh.productType,
  convert: async (cyl: Cylinder): Promise<Mesh> => {
    const { radius, height, smooth, centering } = cyl;
    const center = Vector3.multiplyComponents(centering, Vector3.create(radius, radius, height / 2));

    const h1 = center.z;
    const h2 = center.z + height;

    const c1 = Vector3.create(0, 0, h1);
    const c2 = Vector3.create(0, 0, h2);

    return Mesh.create([...Array(smooth)].flatMap((_, i) => {
      let p1 = [Math.cos(i / smooth * tau) * radius, Math.sin(i / smooth * tau) * radius] as const;
      let p2 = [Math.cos((i + 1) / smooth * tau) * radius, Math.sin((i + 1) / smooth * tau) * radius] as const;
      let p11 = Vector3.create(p1[0], p1[1], h1);
      let p12 = Vector3.create(p1[0], p1[1], h2);
      let p21 = Vector3.create(p2[0], p2[1], h1);
      let p22 = Vector3.create(p2[0], p2[1], h2);
      return [
        Face.create([p21, p11, c1]),
        Face.create([c2, p12, p22]),
        Face.create([p12, p11, p22]),
        Face.create([p22, p11, p21]),
      ];
    }));
  },
  weight: 1,
})

export interface CylArgs {
  radius: number,
  height: number,
  center?: Triplet<number | boolean>,
  smooth?: number,
}

export const cylinder: Component<[CylArgs], LeafElement<Cylinder>> =
  new Component("cyl", (args: CylArgs) =>
    Element.create(Cylinder.create(args.radius, args.height, args.smooth ?? 20, interpretTriplet(args.center, 0)))
  );

export const cyl = cylinder;
