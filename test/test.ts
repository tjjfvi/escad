/* eslint-disable func-call-spacing */
/* eslint-disable no-unexpected-multiline */

import escad, { Component, Operation, timers } from "../packages/core";
import "../packages/builtins/register"
import { renderFunction } from "../packages/renderer/dist";
import { NumberParam } from "../packages/parameters/dist";
import { TranslateArgs, translate, scale } from "../packages/builtins/src";
import { Mesh } from "../packages/mesh/dist";

export const untranslate: Component<TranslateArgs, Operation<Mesh, Mesh>> =
  new Component<TranslateArgs, Operation<Mesh, Mesh>>("untranslate", (...args) =>
    new Operation<Mesh, Mesh>("spread", el =>
      el
      (scale)(-1)
      (translate)(...args)
      (scale)(-1),
    )
  )

export const spread: Component<TranslateArgs, Operation<Mesh, Mesh>> =
  new Component<TranslateArgs, Operation<Mesh, Mesh>>("spread", (...args) =>
    new Operation<Mesh, Mesh>("spread", el =>
      [
        el
        (translate)(...args),
        el
        (untranslate)(...args)
      ]
    )
  )

export default renderFunction({
  outerCubeSize: new NumberParam({ defaultValue: 1 }),
  innerCubeSize: new NumberParam({ defaultValue: .9 }),
  sphereSize: new NumberParam({
    defaultValue: .6,
    desc: "(diameter)",
  })
}, async params => {
  params;
  console.log(spread)
  const el = (
    escad
      .cube({ s: 1 })
      (spread)(1, 0, 0)
      (spread)(0, 1, 0)
      (spread)(0, 0, 1)
      (spread)(2, 0, 0)
      (spread)(0, 2, 0)
      (spread)(0, 0, 2)
      .meld
  );
  console.time("x")
  const r = await (el.val as any).process();
  console.timeEnd("x")
  return r;
});
setInterval(() => {
  console.log(timers);
}, 1000);
