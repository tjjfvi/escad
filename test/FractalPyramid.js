
export default (escad, p) => {

  let parameters = p([
    {
      key:   "order",
      type:    "number",
      min:     1,
      max:     10,
      default: 1,
    }, {
      key:   "sideLength",
      type:    "number",
      min:     0,
      max:     1000,
      step:    1,
      default: 2,
    }, {
      key:   "adjustment",
      type:    "number",
      min:     0,
      max:     100,
      step:    .1,
      default: .3,
    },
  ]);

  let calcHeight = s => Math.sqrt(s ** 2 - (Math.sqrt(2) / 2 * s) ** 2);

  let pyramid = (sideLength, adjustment) => {
    let h = calcHeight(sideLength);

    adjustment = calcHeight(adjustment);

    return escad({
      pyramid: escad.cyl({
        r1: Math.sqrt(2) * sideLength / 2,
        r2: adjustment / h * Math.sqrt(2) * sideLength / 2,
        h: h - adjustment,
        sides: 4
      }).rotate(45).translate(0, 0, (h - adjustment) / 2),
    });
  }

  let fractal = (sideLength, adjustment, order) => {
    order--;
    let sideCount = 2 ** (order - 1);
    let adjustedSideLength = sideLength - adjustment;
    return escad(order === 0 ?
      pyramid(sideLength, adjustment) :
      {
        fractal: escad.union([
          ...[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([x, y]) =>
            t => t.translate([x, y].map(n => n * adjustedSideLength * sideCount / 2))
          ),
          ...[0, 180].map(r =>
            t => t.rotate(0, r, 0).translate(0, 0, calcHeight(adjustedSideLength * sideCount))
          ),
        ].map(m => m(fractal(sideLength, adjustment, order))))
      }
    );
  };

  console.log(parameters);
  return fractal(parameters.sideLength, parameters.adjustment, parameters.order);
  // return pyramid(parameters.sideLength, parameters.adjustment);

}
