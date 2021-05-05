
import { assertNever } from "@escad/core"
import { Tree, TreePart } from "./Tree"
import { TreeText, TreeTextPart } from "./TreeText"
import { treeTextLength } from "./treeTextLength"

/**
 * Finishes a `Tree` to be displayed
 * - Ellipses closed `TreePart.Block`s
 * - Concatentates adjacent `TreePart.Line`s
 * - Applies ranges spanning multiple non-adjacent `TreePart.Line`s to each inner element
 *
 * Example:
 * ```
 * Tree[Line[DummyRangeStart], Line[String], Block, Line[String, RangeEnd], Line[String]]
 * ```
 * becomes
 * ```
 * Tree[Line[DummyRangeStart, String, RangeEnd], Block, Line[DummyRangeStart, String, RangeEnd, String]]
 * ```
 */
export function finalizeTree(originalTree: Tree){
  let treeAcc: Tree = []
  let treeTextAcc: TreeText = []
  let openRanges: TreeText = []
  for(const treePart of originalTree) {
    if(treePart.kind === "line") {
      for(const treeTextPart of treePart.text) {
        treeTextAcc.push(treeTextPart)
        if(treeTextPart.kind === "string" || treeTextPart.kind === "ellipsis")
          continue
        if(treeTextPart.kind === "rangeEnd") {
          openRanges.pop()
          continue
        }
        if(
          treeTextPart.kind === "dummyRangeStart"
          || treeTextPart.kind === "selectableStart"
          || treeTextPart.kind === "openableStart"
        ) {
          openRanges.push(treeTextPart)
          continue
        }
        assertNever(treeTextPart)
      }
      continue
    }
    if(!treePart.state.open) {
      treeTextAcc.push(
        TreeTextPart.OpenableStart(treePart.state),
        TreeTextPart.Ellipsis(),
        TreeTextPart.RangeEnd(),
      )
      continue
    }
    finishTreeTextAcc()
    treeAcc.push({ ...treePart })
  }
  finishTreeTextAcc()

  return treeAcc

  function finishTreeTextAcc(){
    for(const {} of openRanges)
      treeTextAcc.push(TreeTextPart.RangeEnd())
    if(treeTextLength(treeTextAcc))
      treeAcc.push(TreePart.Line(treeTextAcc))
    treeTextAcc = [...openRanges]
  }
}
