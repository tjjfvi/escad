
import ts from "typescript"
import { intersectRanges } from "./intersectRanges"
import { Range } from "./Range"

export function getTsRanges(getRangesForNode: (node: ts.Node) => Iterable<Range>, node: ts.Node){
  const localRanges = [...getRangesForNode(node)].reduce<Range[]>((a, b) => [...intersectRanges(a, [b])], [])
  const childRanges: Range[] = []
  ts.forEachChild(node, child => {
    childRanges.push(...getTsRanges(getRangesForNode, child))
  })
  return intersectRanges(localRanges, childRanges)
}

export const getHoverRangesForNode = (ls: ts.LanguageService) =>
  function*(node: ts.Node): Iterable<Range>{
    if(!ts.isIdentifier(node))
      return
    const sourceFile = node.getSourceFile()
    const path = sourceFile.fileName
    const start = node.getStart(sourceFile, false)
    const end = node.end
    const quickInfo = ls.getQuickInfoAtPosition(path, start)
    if(quickInfo && quickInfo.displayParts) {
      const hoverText = quickInfo.displayParts.map(x => x.text).join("")
      yield {
        start,
        end,
        info: {
          type: "HoverRangeInfo",
          hover: hoverText,
        },
        children: [],
      }
    }
  }

export function* getCollapseRangesForNode(node: ts.Node): Iterable<Range>{
  if(ts.isSourceFile(node)) {
    let currentGroup: ts.ImportDeclaration[] = []
    const children: ts.Node[] = []
    ts.forEachChild(node, child => void children.push(child))
    for(const child of [...children, undefined]) {
      if(child && ts.isImportDeclaration(child)) {
        currentGroup.push(child)
        continue
      }
      if(!currentGroup.length)
        continue
      yield* collapseNodes(currentGroup, "import ".length)
      currentGroup = []
    }
  }
  if(ts.isClassDeclaration(node)) {
    const children = node.getChildren()
    if(node.name)
      yield* collapseNodes(children.slice(children.indexOf(node.name) + 1))
    else
      yield* collapseNodes(children.slice(children.findIndex(x => x.kind === ts.SyntaxKind.ClassKeyword)))
  }
}

function* collapseNodes(nodes: ts.Node[], prefixLength = 0): Iterable<Range>{
  if(!nodes.length) return
  const sourceFile = nodes[0].getSourceFile()
  const start = nodes[0].getStart(sourceFile) + prefixLength
  const row = sourceFile.getLineAndCharacterOfPosition(start).line
  yield {
    start,
    end: start,
    info: {
      type: "EllipsisRangeInfo",
      row,
    },
    children: [],
  }
  yield {
    start,
    end: nodes[nodes.length - 1].end,
    info: {
      type: "CollapseRangeInfo",
      row,
    },
    children: [],
  }
}
