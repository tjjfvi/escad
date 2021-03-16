
import { Ranges, Range } from "./Range"

export function* intersectRanges(rangesA: Ranges, rangesB: Ranges): Iterable<Range>{
  while(true) {
    if(!rangesA.length)
      return yield* rangesB
    if(!rangesB.length)
      return yield* rangesA
    const [rangeA] = rangesA
    let [rangeB] = rangesB
    if(rangeA.end <= rangeB.start) {
      rangesA.shift()
      yield rangeA
      continue
    }
    if(rangeB.end <= rangeA.start) {
      rangesB.shift()
      yield rangeB
      continue
    }
    if(rangeA.start === rangeA.end) {
      rangesA.shift()
      rangesB.shift()
      const [left, right] = splitRange(rangeB, rangeA.start)
      yield left
      yield rangeA
      rangesB.unshift(right)
      continue
    }
    rangesB.shift()
    if(rangeB.start < rangeA.start) {
      const [left, right] = splitRange(rangeB, rangeA.start)
      yield left
      rangeB = right
    }
    if(rangeB.end > rangeA.end) {
      const [left, right] = splitRange(rangeB, rangeA.end)
      rangeB = left
      rangesB.unshift(right)
    }
    rangeA.children = [...intersectRanges(rangeA.children, [rangeB])]
  }
}

function splitRange(range: Range, pos: number){
  if(pos <= range.start || pos >= range.end)
    throw new Error("Cannot split range by pos outside of it")
  const left: Range = {
    start: range.start,
    end: pos,
    info: range.info,
    children: [],
  }
  const right: Range = {
    start: pos,
    end: range.end,
    info: range.info,
    children: [],
  }
  for(const child of range.children) {
    if(child.end <= pos) {
      left.children.push(child)
      continue
    }
    if(child.start >= pos) {
      right.children.push(child)
      continue
    }
    const [leftChild, rightChild] = splitRange(child, pos)
    left.children.push(leftChild)
    right.children.push(rightChild)
  }
  return [left, right] as const
}
