
import "../packages/builtins/register";
import { renderFunction } from "../packages/renderer";
import { numberParam } from "../packages/parameters";
import { cube } from "../packages/solids/dist";

export default renderFunction(
  {
    outerSize: numberParam({
      defaultValue: 1,
      min: 0,
    }),
    innerSize: numberParam({
      defaultValue: .9,
      min: 0,
    }),
  },
  ({ outerSize, innerSize }) => (
    cube({ s: outerSize })
      .sub(cube({ s: innerSize }))
      .sub(cube({ s: outerSize, c: false }))
  )
);
