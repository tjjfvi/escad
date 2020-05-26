
import escad, { diff, Component, cube } from "../src/core";

export default () => {
  return escad
    .cube({ s: 1 })
    .diff(escad
      .cube({ s: .9 })
      .cube({ s: 1, c: false })
    )
  // return escad.cube({ s: 1 }).diff(escad.cube({ s: 1, c: false }));
}