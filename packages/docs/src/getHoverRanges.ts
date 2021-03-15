
import ts from "typescript"
import { Range } from "./Range"

export function* getHoverRanges(path: string, sourceFile: ts.SourceFile, ls: ts.LanguageService): Iterable<Range>{
  for(const span of getIdentifierSpans(sourceFile)) {
    const quickInfo = ls.getQuickInfoAtPosition(path, span.start)
    if(!quickInfo || !quickInfo.displayParts)
      continue
    const hoverText = quickInfo.displayParts.map(x => x.text).join("")
    yield {
      start: span.start,
      end: span.start + span.length,
      info: [{
        type: "HoverRangeInfo",
        hover: hoverText,
      }],
    }
  }
}

function getIdentifierSpans(sourceFile: ts.SourceFile){
  const spans: ts.TextSpan[] = []
  checkNode(sourceFile)
  return spans

  function checkNode(node: ts.Node){
    if(ts.isIdentifier(node)) {
      const start = node.getStart(sourceFile, false)
      spans.push(ts.createTextSpan(start, node.end - start))
    }
    ts.forEachChild(node, checkNode)
  }
}
