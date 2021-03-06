
import "../packages/builtins/register";
import { renderFunction } from "../packages/renderer/dist";
import { booleanParam, numberParam } from "../packages/builtins/dist";
import { cube, sub } from "../packages/builtins/dist";
import escad, { objectParam } from "../packages/core/dist";

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
