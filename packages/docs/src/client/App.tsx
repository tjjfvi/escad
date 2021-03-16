
import React from "react"
import { getFile, getRanges } from "./data"
import { file } from "./location"
import { usePromise } from "./usePromise"
import { RangesView } from "./Ranges"

export const App = () => {
  const ranges = usePromise(() => getRanges(file))
  const source = usePromise(() => getFile(file))
  if(!ranges || !source)
    return null
  return <>
    <RangesView ranges={ranges} source={source}/>
  </>
}
