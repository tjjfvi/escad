
import "../../stylus/Ranges.styl"
import React, { createContext, useContext, useEffect, useState } from "react"
import { NewlineRangeInfo, Range } from "../Range"
import { useValue } from "rhobo"

export const RangesView = ({ ranges, source }: { ranges: Range[], source: string }) => <>
  <div className="Ranges">
    <collapseStatesContext.Provider value={useValue(() => [])}>
      {ranges.map((range, i) =>
        <RangeView range={range} key={i} source={source}/>,
      )}
    </collapseStatesContext.Provider>
  </div>
</>

const RangeView = ({ range, source }: { range: Range, source: string }) => {
  const rangeInfo = range.info
  if(rangeInfo.type === "EllipsisRangeInfo") {
    const collapseState = useCollapseState(rangeInfo.row)
    if(collapseState ?? true)
      return <span className="RangeView ellipsis">...</span>
    else
      return null
  }
  if(rangeInfo.type === "CollapseRangeInfo") {
    const collapseState = useCollapseState(rangeInfo.row)
    if(collapseState ?? true)
      return null
  }
  if(rangeInfo.type === "NewlineRangeInfo")
    return <span className="RangeView"><Newline {...rangeInfo}/></span>
  if(rangeInfo.type === "NullRangeInfo")
    return <span className="RangeView">
      {source.slice(range.start, range.end)}
    </span>
  const style = rangeInfo.type === "ThemeRangeInfo" ? {
    color: rangeInfo.foreground,
  } : undefined
  const title = rangeInfo.type === "HoverRangeInfo" ? rangeInfo.hover : undefined
  return <span className="RangeView" style={style} title={title}>
    {range.children.map((range, i) =>
      <RangeView range={range} source={source} key={i}/>,
    )}
  </span>
}

const Newline = ({ row }: NewlineRangeInfo) => {
  const collapseStates = useContext(collapseStatesContext)
  const collapsed = useCollapseState(row)
  return <span
    className="Newline"
    onClick={() => {
      setCollapseState(collapseStates, row, !collapsed)
    }}
  >
    {row + 1}
  </span>
}

type CollapseStates = [boolean, Set<() => void>][]

const collapseStatesContext = createContext<CollapseStates | null>(null)

const setCollapseState = (collapseStates: CollapseStates | null, line: number, value: boolean) => {
  if(!collapseStates)
    throw new Error("Expected to have a collapseStatesContext")
  const collapseState = collapseStates[line] ??= [true, new Set()]
  collapseState[0] = value
  collapseState[1].forEach(fn => fn())
}

const useCollapseState = (line: number) => {
  const collapseStates = useContext(collapseStatesContext)
  if(!collapseStates)
    throw new Error("Expected to have a collapseStatesContext")
  const collapseState = collapseStates[line] ??= [true, new Set()]
  const [value, setValue] = useState(collapseState[0])
  useEffect(() => {
    const handler = () => setValue(collapseState[0])
    collapseState[1].add(handler)
    return () => void collapseState[1].delete(handler)
  }, [])
  return value
}
