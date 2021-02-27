
import "../packages/builtins/register";
import { renderFunction } from "../packages/renderer/dist";
import { booleanParam, numberParam, objectParam } from "../packages/parameters/dist";
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
  ({ outerSize, hollow: { enabled: hollow, innerSize } }) =>
    escad
      .cube({ size: outerSize })
      ._(hollow ? sub(cube({ size: innerSize })) : escad)
      .sub(cube({ size: outerSize, center: false }))
);
