
import { finalizeTree } from "./finalizeTree.ts"
import { Tree, TreePart } from "./Tree.ts"
import { treeTextLength } from "./treeTextLength.ts"

/**
 * Equally flattens a tree's children up until it's fully flattened or there's no more room in `maxLength`
 * @param tree The tree to flatten
 * @param maxLength The output tree's lines will all be under this length, if possible
 * @param flattenOpenable
 *   Whether or not to flatten nodes that should be openable with an arrow. Used in `getExpandableSections`
 */
export function flattenTree(tree: Tree, maxLength: number, flattenOpenable = true){
  while(true) {
    const newTree = []
    let changed = false
    for(const part of tree) {
      const flattened =
        part.kind === "block"
        && !part.state.open
        && !part.forceEllipsis
        && (flattenOpenable || !part.forceOpenable)
          ? interleaveFlat(part.children, TreePart.Line.String(part.joiner ?? ""))
          : null // no change
      newTree.push(...(flattened ?? [part]))
      changed ||= !!flattened
    }
    if(!changed || !checkTreeWithinMaxLength(newTree, maxLength))
      return tree
    tree = newTree
  }
}

function checkTreeWithinMaxLength(tree: Tree, maxLength: number){
  return finalizeTree(tree).every(x => x.kind === "block" || treeTextLength(x.text) <= maxLength)
}

/** Similar to [].join */
function interleaveFlat<T, U>(array: ReadonlyArray<ReadonlyArray<T>>, separator: U){
  const newArray: Array<T | U> = []
  let first = true
  for(const value of array) {
    if(!first) newArray.push(separator)
    newArray.push(...value)
    first = false
  }
  return newArray
}
