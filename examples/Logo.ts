
import "../packages/builtins/register"
import { renderFunction } from "../packages/renderer/dist"
import { booleanParam, numberParam } from "../packages/builtins/dist"
import escad, { objectParam } from "../packages/core/dist"

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
    }),
  },
  ({ outerSize, hollow: { enabled: hollow, innerSize } }) => {
    console.log("Example of output from project `console.log`:")
    console.log("Arguments:", { outerSize, hollow, innerSize })
    const main = escad.cube({ size: outerSize })
    const inner = escad.cube({ size: innerSize })
    const corner = escad.cube({ size: outerSize, center: 1 })
    const final = main
      ._(hollow ? escad.sub(inner) : escad)
      .sub(corner)
    console.log("Resulting:", { main, inner, corner, final })
    return final
  },
)
