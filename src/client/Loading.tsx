import "./stylus/Loading.styl";
import React from "../deps/react.ts";

export const Loading = (
  { className, size }: { className?: string; size?: number },
) => (
  <div
    className={"Loading " + (className ?? "")}
    style={size === undefined ? {} : { "--size": size + "px" } as never}
  />
);
