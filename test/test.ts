
import escad from "../packages/core";
import "../packages/solids";
import "../packages/csg";

export default () => {
  return (
    escad
      .cube({ s: 1 })
      .cube({ s: .9 })
      .cube({ s: 1, c: false })
      .diff
      .sphere({ r: .3, slices: 50, stacks: 25 })
      .meld
  )
};