
import escad, { diff, Component, cube, Operation, Mesh } from "../src/core";

export default () => {

  let opts = {
    scale: 1,
    sides: 50,
  }

  let cyl = (({ sides } = opts) =>
    escad.cyl({
      r1: 20, r2: 8,
      h: 40,
      os: [[12, 0], [0, 0]],
      // ios: [[12, 0], [0, 0]],
      sides,
    })
  )

  let both = ((o = opts) => {
    return (escad
      .translate(-6, 0, -10)
      .union(
        cyl(o),

        escad
          .translate(12, 0, 20)
          .rotate(0, 180, 0)
          (cyl(o)),
      )
    );
  });

  // let single = new escad.Model(({ filled, top, rotateTop, sides } = opts) =>
  //   escad
  //     .rotate(0, -144.5, 0)
  //     .rotate(0, 0, top && rotateTop ? 180 : 0)
  //     .difference()(
  //       escad.rotate(0, 144.5, 0)(both({ filled, sides })),

  //       escad
  //         .translate(-50, -50, top ? 0 : -100)
  //         .cube({ sideLength: 100, center: false }),
  //     )
  // );

  // let output = new escad.Model(({ scale, single: s, rotateTop, ...args } = opts) =>
  //   escad.scale(scale)(
  //     !s && rotateTop ?
  //       escad.union()(
  //         single({ ...args, rotateTop, top: false }),
  //         single({ ...args, rotateTop, top: true }),
  //       ) :
  //       (s ? single : both)({ ...args, rotateTop })
  //   )
  // );


  return both(opts);

};