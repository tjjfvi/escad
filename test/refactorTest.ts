
import "../packages/builtins/register";
import { renderFunction } from "../packages/renderer";
import { booleanParam, numberParam, objectParam } from "../packages/parameters";
import { cube } from "../packages/solids/dist";
import { sub } from "../packages/csg/dist";
import escad from "../packages/core/dist";

export default renderFunction(
  {
    outerSize: numberParam({
      defaultValue: 1,
      min: 0,
    }),
    hollow: objectParam({
      enabled: booleanParam({ defaultValue: true, desc: "Should the cube be hollow?" }),
      innerSize: numberParam({
        defaultValue: .9,
        min: 0,
      }),
    })
  },
  ({ outerSize, hollow: { enabled: hollow, innerSize } }) => (
    cube({ s: outerSize })
      ._(hollow ? sub(cube({ s: innerSize })) : escad())
      .sub(cube({ s: outerSize }).translate(outerSize / 2, outerSize / 2, outerSize / 2).translate(0, 0, 0))
  )

);
