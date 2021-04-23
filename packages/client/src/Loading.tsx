
import "../stylus/Loading.styl"
import React from "react"

export const Loading = ({ className, size }: { className?: string, size?: number }) =>
  <div
    className={"Loading " + (className ?? "")}
    style={size === undefined ? {} : { "--size": size + "px" } as never}
  />
