
import { finalizeTree } from "./finalizeTree"
import { Tree, TreePart } from "./Tree"
import { TreeTextPart, TreeText } from "./TreeText"

/**
 * Equally flattens a tree's children up until it's fully flattened or there's no more room in `maxLength`
 * @param tree The tree to flatten
 * @param maxLength The output tree's lines will all be under this length, if possible
 * @param flattenOpenable
 *   Whether or not to flatten nodes that should be openable with an arrow. Used in `getExpandableSections`
 */
export function flattenTree(tree: Tree, maxLength: number, flattenOpenable = true){
  let last = tree
  let cur = flattenTreeOnce(tree, flattenOpenable)
  while(cur.length !== last.length && checkTreeWithinMaxLength(cur, maxLength)) {
    last = cur
    cur = flattenTreeOnce(cur, flattenOpenable)
  }
  return last
}

function flattenTreeOnce(tree: Tree, flattenOpenable = true): Tree{
  const maybeWrapForceOpenable = (part: TreePart.Children, inner: Tree): Tree =>
    part.forceOpenable
      ? [
        TreePart.Text(TreeTextPart.OpenableStart(part.state)),
        ...inner.map(innerPart =>
          innerPart.kind === "text"
            ? TreePart.Text(removeSelectableRanges(innerPart.text))
            : innerPart,
        ),
        TreePart.Text(TreeTextPart.RangeEnd()),
      ]
      : [...inner, TreePart.Text.String("")] // Increase the length so that we know there's more work to be done
  return tree.flatMap(part => {
    if(part.kind === "text" || part.state.open || part.forceEllipsis)
      return [part]
    if(part.children.length === 1 && (flattenOpenable || !part.forceOpenable))
      return maybeWrapForceOpenable(part, part.children[0])
    if(flattenOpenable)
      return maybeWrapForceOpenable(part, interleave(part.children, TreePart.Text.String(part.joiner ?? "")).flat())
    return [part]
  })
}

function removeSelectableRanges(text: TreeText): TreeText{
  return text.map(part =>
    part.kind === "selectableStart"
      ? TreeTextPart.DummyRangeStart()
      : part,
  )
}

function checkTreeWithinMaxLength(tree: Tree, maxLength: number){
  return finalizeTree(tree).every(x => x.kind !== "text" || treeTextLength(x.text) <= maxLength)
}

function treeTextLength(text: TreeText): number{
  let total = 0
  for(const part of text)
    if(part.kind === "string")
      total += part.string.length
    else if(part.kind === "ellipsis")
      total += 2 // The space between the dots is shrunk
  return total
}

/** Like [].join, but doesn't concat the elements into strings */
function interleave<T, U>(iterable: Iterable<T>, separator: U){
  const arr: Array<T | U> = []
  let first = true
  for(const value of iterable) {
    if(!first) arr.push(separator)
    arr.push(value)
    first = false
  }
  return arr
}
