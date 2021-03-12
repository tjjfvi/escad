// @ts-nocheck

export default (escad, p) => {

  let parameters = p([
    {
      key: "sides",
      type: "number",
      min: 1,
      max: 10,
      default: 12,
    }, {
      key: "key2",
      type: "number",
      min: 0,
      max: 1000,
      step: 1,
      default: 2,
    }, {
      key: "key3",
      type: "number",
      min: 0,
      max: 100,
      step: .1,
      default: .3,
    },
  ])

  const d = 32
  const t = .8
  const h = 10
  const r = d / 2

  const { sides } = parameters
  const outer = escad.cyl({
    r: r + t,
    h: h + t,
    c: false,
    sides,
  })
  const negative = escad.cyl({
    r,
    h,
    c: false,
    sides,
  })
  const shell = escad
    .diff(outer, negative)
    .rotate([0, 180, 0])

  const out = shell

  console.log(parameters)
  // return fractal(parameters.sideLength, parameters.adjustment, parameters.order);
  // return pyramid(parameters.sideLength, parameters.adjustment);
  return out

}
