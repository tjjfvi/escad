import escad, { Element } from "../packages/core";
import "../packages/builtins/register";
import { renderFunction } from "../packages/renderer";
import { numberParam } from "../packages/renderer/node_modules/@escad/parameters/dist";
import { Mesh } from "../packages/csg/node_modules/@escad/builtins/dist";

export default renderFunction(
  {
    order: numberParam({
      min: 1,
      max: 10,
      defaultValue: 1,
    }),
    sideLength: numberParam({
      min: 0,
      max: 1000,
      // step: 1,
      defaultValue: 2,
    }),
    adjustment: numberParam({
      min: 0,
      max: 100,
      // step: .1,
      defaultValue: .3,
    }),
  },
  parameters => {

    let calcHeight = (s: number) => Math.sqrt(s ** 2 - (Math.sqrt(2) / 2 * s) ** 2);

    let pyramid = (sideLength: number, adjustment: number) => {
      let h = calcHeight(sideLength);

      adjustment = calcHeight(adjustment);

      return escad<Mesh>({
        pyramid: escad.cyl({
          r1: Math.sqrt(2) * sideLength / 2,
          r2: adjustment / h * Math.sqrt(2) * sideLength / 2,
          i: .00001,
          h: h - adjustment,
          sides: 4,
        }).rotateZ(45).translate(0, 0, (h - adjustment) / 2),
      });
    }

    let fractal = (sideLength: number, adjustment: number, order: number): Element<Mesh> => {
      order--;
      let sideCount = 2 ** (order - 1);
      let adjustedSideLength = sideLength - adjustment;
      if(order === 0)
        return pyramid(sideLength, adjustment);
      const sub = fractal(sideLength, adjustment, order);
      return escad<Mesh>({
        fractal: escad.union([
          ...[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([x, y]) =>
            sub.translate(...[x, y, 0].map(n => n * adjustedSideLength * sideCount / 2) as any),
          ),
          ...[0, 180].map(r =>
            sub.rotate(0, r, 0).translate(0, 0, calcHeight(adjustedSideLength * sideCount)),
          ),
        ]),
      });
    };

    console.log(parameters);
    return fractal(parameters.sideLength, parameters.adjustment, parameters.order);
    // return escad.cyl({ r: 1, i: .00001, h: 20, sides: 12 })

  });
