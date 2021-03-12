
import "../stylus/Pane.styl"
import React from "react";
import { useObservable } from "rhobo";

export type PaneArgs = {
  name: string,
  className?: string,
  children: React.ReactNode,
  left?: boolean,
  right?: boolean,
  defaultWidth?: number,
  resizable?: boolean,
  defaultOpen?: boolean,
  minWidth?: number,
}

// eslint-disable-next-line react/prop-types
export const Pane = ({
  name,
  className = name,
  children,
  right = false,
  left = !right,
  defaultWidth = 500,
  resizable = true,
  defaultOpen = false,
  minWidth = 100,
}: PaneArgs) => {
  const width = useObservable.use(defaultWidth);
  const open = useObservable.use(defaultOpen);
  const resizing = useObservable.use(false);
  if(!resizing() && width() < minWidth)
    width(minWidth);
  return <div
    className={
      "Pane "
      + (left ? "left " : "right ")
      + (open() ? "open " : "")
      + (resizing() ? "resizing " : "")
      + (resizable && open() ? "resizable " : "")
      + className
    }
    style={{ maxWidth: open() ? Math.max(width(), minWidth) : 50 }}
  >
    <div
      className="border"
      onMouseDown={() => {
        if(!resizable || !open()) return;
        resizing(true);
        const mouseMoveHandler = (e: MouseEvent) => {
          if(e.buttons)
            width(width() + e.movementX * (left ? 1 : -1));
          else {
            document.documentElement.removeEventListener("mousemove", mouseMoveHandler)
            resizing(false);
          }
        }
        document.documentElement.addEventListener("mousemove", mouseMoveHandler);
      }}
    />
    <div className="side" onClick={() => open(!open())}><span>{name}</span></div>
    <div className="content" style={{ minWidth: Math.max(width(), minWidth) - 50 }}>{children}</div>
  </div>
}
