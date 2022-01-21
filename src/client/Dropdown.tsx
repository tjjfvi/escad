
import "../stylus/Dropdown.styl"
import React from "react.ts"
import { Observable, observer } from "rhobo.ts"

export interface DropdownProps<T> {
  options: Record<string, T>,
  value: Observable<T>,
}

export const Dropdown = observer(<T, >({ options, value }: DropdownProps<T>) => {
  const key = Object.entries(options).find(([, v]) => v === value())?.[0]
  if(!key) throw new Error("Value passed to Dropdown not in options")
  return <div className="Dropdown">
    <select value={key} onChange={event => value(options[event.target.value])}>
      {Object.keys(options).map(key =>
        <option key={key} value={key}>{key}</option>,
      )}
    </select>
  </div>
})
