
import escad from "../packages/core";
import "../packages/builtins/register"

export default async () => {
  const el = (
    escad
      .cube({ s: 1 })
      .cube({ s: .9 })
      .cube({ s: 1, c: false })
      .diff
      .sphere({ r: .5, slices: 50, stacks: 25 })
      .union
      .meld
  );
  return el;
};
