import "../src/3d/register.ts";
import { renderFunction } from "../src/server/renderer.ts";
import { booleanParam, numberParam } from "../src/3d/mod.ts";
import { escad, log, objectParam } from "../src/core/mod.ts";

export default renderFunction(
  {
    outerSize: numberParam({
      defaultValue: 1,
      min: 0,
    }),
    hollow: objectParam({
      enabled: booleanParam({
        defaultValue: true,
        desc: "Should the cube be hollow?",
      }),
      innerSize: numberParam({
        defaultValue: .9,
        min: 0,
      }),
    }),
  },
  ({ outerSize, hollow: { enabled: hollow, innerSize } }) => {
    log("Example of output", "from project `console.log`:");
    log("Arguments:", { outerSize, hollow, innerSize });
    const main = escad.cube({ size: outerSize });
    const inner = escad.cube({ size: innerSize });
    const corner = escad.cube({ size: outerSize, shift: 1 });
    const final = main
      ._(hollow ? escad.sub(inner) : escad)
      .sub(corner);
    log("Resulting:", { main, inner, corner, final });
    return final;
  },
);
