
import escad, { ExportType } from "../packages/core";
import "../packages/builtins/register"
import { Mesh } from "../packages/builtins/";

export default () => {
  const el = (
    escad
      .cube({ s: 1 })
      .cube({ s: .9 })
      .cube({ s: 1, c: false })
      .diff
      .sphere({ r: .5, slices: 50, stacks: 25 })
      .union
      .meld
  );
  const mesh = el.toArrayFlat()[0];
  ExportType.Registry.getAll(Mesh)[0].manager.store(mesh.sha, Mesh.convert(mesh).process());
  return el;
};
