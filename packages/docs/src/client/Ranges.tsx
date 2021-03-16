
import "../../stylus/Ranges.styl"
import React from "react"
import { NewlineRangeInfo, Range, ThemeRangeInfo } from "../Range"

export const RangesView = ({ ranges, source }: { ranges: Range[], source: string }) => <>
  <div className="Ranges">
    {ranges.map((range, i) =>
      <RangeView range={range} key={i} source={source}/>,
    )}
  </div>
</>

const RangeView = ({ range, source }: { range: Range, source: string }) => {
  const newlineRangeInfo = range.info.find((x): x is NewlineRangeInfo => x.type === "NewlineRangeInfo")
  const theme = range.info.find((x): x is ThemeRangeInfo => x.type === "ThemeRangeInfo")
  return <span className="RangeView" style={{
    color: theme?.foreground,
  }}>
    {newlineRangeInfo && <Newline {...newlineRangeInfo}/>}
    {source.slice(range.start, range.end)}
  </span>
}

const Newline = ({ row }: NewlineRangeInfo) =>
  <span className="Newline">{row}</span>
