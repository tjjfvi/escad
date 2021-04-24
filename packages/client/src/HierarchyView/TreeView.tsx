
import React, { useState } from "react"
import { collapseTree } from "./collapseTree"
import { finalizeTree } from "./finalizeTree"
import { Tree, TreePart } from "./Tree"
import { TreeText } from "./TreeText"
import { TreeTextView } from "./TreeTextView"

const arrowWidth = 25
const characterWidth = 10

export const TreeView = ({ tree, width, selectable }: { tree: Tree, width: number, selectable: boolean }) => {
  const [, _update] = useState({})
  const update = () => _update({})
  const innerWidth = width - arrowWidth
  const maxLength = innerWidth / characterWidth

  const collapsedTree = collapseTree(tree, maxLength)
  const joinedCollapsedTree = finalizeTree(collapsedTree)

  return <div className="TreeNode">
    {joinedCollapsedTree.map((part, i) => {
      const prev = joinedCollapsedTree[i - 1]
      const next = joinedCollapsedTree[i + 1]

      if(part.kind === "children")
        return <div className="children" key={i}>
          {part.children.map((y, i) => <TreeView selectable={selectable} width={innerWidth} tree={y} key={i}/>)}
        </div>

      if(next && next.kind === "children")
        return <Line
          key={i}
          selectable={selectable}
          arrowState="open"
          text={part.text}
          onUpdate={update}
          onClick={() => (next.state.open = false, update())}
        />

      const expandableSections = getExpandableSections(tree, maxLength)

      const sectionsSplitInd =
        prev?.kind === "children"
          ? expandableSections.findIndex(v => v.state === prev.state) + 1
          : 0
      const relevantSections = expandableSections.slice(sectionsSplitInd)

      if(!relevantSections.length)
        return <Line
          key={i}
          selectable={selectable}
          arrowState="leaf"
          text={part.text}
          onUpdate={update}
        />

      return <Line
        key={i}
        selectable={selectable}
        arrowState="closed"
        text={part.text}
        onUpdate={update}
        onClick={() => {
          relevantSections.forEach(x => x.state.open = true)
          update()
        }}
      />
    })}</div>
}

type LineProps = {
  arrowState: "leaf" | "open" | "closed",
  text: TreeText,
  onClick?: () => void,
  onUpdate: () => void,
  selectable: boolean,
}

const Line = ({ arrowState, text, onClick, onUpdate, selectable }: LineProps) =>
  <div className="line" onDoubleClick={onClick}>
    <div className={ "arrow " + arrowState } onClick={onClick}></div>
    <TreeTextView selectable={selectable} text={text} onUpdate={onUpdate}/>
  </div>

function getExpandableSections(tree: Tree, maxLength: number){
  return collapseTree(tree, maxLength, false).filter((x): x is TreePart.Children => x.kind === "children")
}
