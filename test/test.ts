
import escad, { ExportTypeRegistry, ExportType, Product } from "../packages/core";
import "../packages/solids";
import "../packages/csg";
import { Mesh } from "../packages/mesh/dist";

export default () => {
  const el = (
    escad
      .cube({ s: 1 })
      .cube({ s: .9 })
      .cube({ s: 1, c: false })
      .diff
      .sphere({ r: .3, slices: 50, stacks: 25 })
      .meld
  );
  const mesh = el.toArrayFlat()[0];
  Product.ExportTypeRegistry.getAll(Mesh)[0].manager.store(mesh.sha, mesh.process());
  return el;
};