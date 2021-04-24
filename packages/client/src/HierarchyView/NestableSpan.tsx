
import React, { useContext } from "react"
import { useObservable } from "rhobo"
import { ClientState } from "../ClientState"

export interface NestableSpanProps {
  className?: string,
  onClick?: (event: React.MouseEvent) => void,
  children: React.ReactNode,
}

export const NestableSpan = ({ className, onClick, children }: NestableSpanProps) => {
  const state = useContext(ClientState.Context)
  const handleHover = (e: React.MouseEvent) => {
    if(!onClick) return
    const value = e.type === "mousemove" && !e.defaultPrevented
    if(hovered.value !== value) hovered(value)
    e.preventDefault()
  }
  const hovered = useObservable.use(false)
  state.selection.use()
  return <span
    className={(className ?? "") + (hovered() ? " hover" : " ")}
    onClick={onClick && (event => {
      if(!onClick) return
      event.stopPropagation()
      onClick(event)
    })}
    onMouseMove={handleHover}
    onMouseLeave={handleHover}
    children={children}
  />
}
