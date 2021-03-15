
import { Ranges, Range } from "./Range"

export function* intersectRanges(rangesA: Ranges, rangesB: Ranges): Iterable<Range>{
  while(true) {
    if(!rangesA.length)
      return yield* rangesB
    if(!rangesB.length)
      return yield* rangesA
    if(rangesA[0].start > rangesB[0].start)
      [rangesA, rangesB] = [rangesB, rangesA]
    const [rangeA] = rangesA
    if(rangeA.start === rangeA.end) {
      rangesA.shift()
      yield rangeA
      continue
    }
    let lastInd = rangeA.start
    while(rangesB.length) {
      const [rangeB] = rangesB
      if(lastInd < rangeB.start && lastInd < rangeA.end)
        yield {
          start: lastInd,
          end: Math.min(rangeA.end, rangeB.start),
          info: rangeA.info,
        }
      if(rangeB.start >= rangeA.end)
        break
      rangesB.shift()
      yield {
        start: rangeB.start,
        end: Math.min(rangeA.end, rangeB.end),
        info: [...rangeA.info, ...rangeB.info],
      }
      lastInd = rangeB.end
      if(rangeA.end < rangeB.end) {
        rangesB.unshift({
          start: rangeA.end,
          end: rangeB.end,
          info: rangeB.info,
        })
        break
      }
    }
    if(!rangesB.length && lastInd < rangeA.end)
      yield {
        start: lastInd,
        end: rangeA.end,
        info: rangeA.info,
      }
    rangesA.shift()
  }
}
