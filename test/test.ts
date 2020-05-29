
import escad from "../src/core";

export default () => {
  console.log(escad.translate(1, 2, 3)([
    escad.cube({ s: 1 }),
    [
      escad.cube({ s: 1 }),
      [escad.cube({ s: 1 })],
      [],
    ],
  ]).hierarchy)
  return (
    escad
      .cube({ s: 1 })
      .cube({ s: .9 })
      .cube({ s: 1, c: false })
      .diff
  )
  // return (
  //   escad
  //     .cube({ s: 1 })
  //     .sub(
  //       escad
  //         .cube({ s: .9 })
  //         .cube({ s: 1, c: false })
  //     )
  // );
};