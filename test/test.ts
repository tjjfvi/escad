
import escad from "../packages/core";
import "../packages/builtins/register"
import { renderFunction } from "../packages/renderer/dist";
import { NumberParam } from "../packages/parameters/dist";

export default renderFunction({
  outerCubeSize: new NumberParam({ defaultValue: 1 }),
  innerCubeSize: new NumberParam({ defaultValue: .9 }),
  sphereSize: new NumberParam({
    defaultValue: .6,
    desc: "(diameter)",
  })
}, params => {
  const el = (
    escad
      .cube({ s: params.outerCubeSize })
      .cube({ s: params.innerCubeSize })
      .cube({ s: params.outerCubeSize, c: false })
      .diff
      .sphere({ r: params.sphereSize / 2,  slices: 50, stacks: 25 })
      .meld
  );
  return el;
});
