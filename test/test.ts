
import escad, { ExportType } from "../packages/core";
import "../packages/solids";
import "../packages/csg";
import { Mesh } from "../packages/mesh";

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
  ExportType.Registry.getAll(Mesh)[0].manager.store(mesh.sha, Mesh.convert(mesh).process());
  return el;
};
