import "../src/builtins/register.ts";
import escad, {
  booleanParam,
  log,
  numberParam,
  objectParam,
  parametrize,
} from "../src/core/mod.ts";

export default parametrize(
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
