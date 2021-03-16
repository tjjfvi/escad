
import { Range } from "./Range"

export function* getLineRanges(source: string): Iterable<Range>{
  let totalInd = 0
  for(const [row, line] of source.split("\n").entries()) {
    yield {
      start: totalInd,
      end: totalInd,
      info: {
        type: "NewlineRangeInfo",
        row,
      },
      children: [],
    }
    totalInd += line.length + 1
  }
}
