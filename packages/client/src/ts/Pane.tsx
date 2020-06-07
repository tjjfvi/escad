
import React from "react";
import { useObservable } from "rhobo";

export type PaneArgs = {
  name: string,
  className?: string,
  children: React.ReactChildren,
  left?: boolean,
  right?: boolean,
}

// eslint-disable-next-line react/prop-types
const Pane = ({ name, className = name, children, right = false, left = !right }: PaneArgs) => {
  const open = useObservable.use(false);
  return <div className={(open() ? "open " : "") + (left ? "left" : "right") + " Pane " + className}>
    <div className="side" onClick={() => open(!open())}><span>{name}</span></div>
    <div>{children}</div>
  </div>
}

export default Pane;
