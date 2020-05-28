
import escad from "../src/core";

export default () => {
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