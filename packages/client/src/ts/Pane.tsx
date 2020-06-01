// @ts-nocheck

import React from "react";
import { useObservable } from "rhobo";

const Pane = ({ name, className = name, children, right = false, left = !right }) => {
  let open = useObservable.use(false);
  return <div className={(open() ? "open " : "") + (left ? "left" : "right") + " Pane " + className}>
    <div className="side" onClick={() => open.toggle()}><span>{name}</span></div>
    <div>{children}</div>
  </div>
}

export default Pane;
