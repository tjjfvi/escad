
import { assertNever, Hash } from "@escad/core"
import React, { useContext } from "react"
import { observer } from "rhobo"
import { ClientState } from "../ClientState"
import { NestableSpan } from "./NestableSpan"
import { TreeText, TreeTextPart } from "./TreeText"

export interface TreeTextViewProps {
  text: TreeText,
  selectable: boolean,
  onUpdate: () => void,
}

export const TreeTextView = ({ text, selectable, onUpdate }: TreeTextViewProps) => {
  type Wrapper = Pick<TreeTextPartViewProps, "children" | "opener">
  let wrapperStack: Wrapper[] = [{
    children: [],
    opener: TreeTextPart.DummyRangeStart(),
  }]
  for(const [index, part] of text.entries()) {
    const currentWrapper = wrapperStack[wrapperStack.length - 1]
    if(part.kind === "string") {
      currentWrapper.children.push(part.string)
      continue
    }
    if(part.kind === "ellipsis") {
      currentWrapper.children.push(<span className="ellipsis" key={index}>{"···"}</span>)
      continue
    }
    if(
      part.kind === "dummyRangeStart"
        || part.kind === "openableStart"
        || part.kind === "selectableStart"
    ) {
      wrapperStack.push({
        children: [],
        opener: part,
      })
      continue
    }
    if(part.kind === "rangeEnd") {
      const previousWrapper = wrapperStack[wrapperStack.length - 2]
      previousWrapper.children.push(
        <TreeTextPartView
          key={index}
          onUpdate={onUpdate}
          selectable={selectable}
          opener={currentWrapper.opener}
          children={currentWrapper.children}
        />,
      )
      wrapperStack.pop()
      continue
    }
    assertNever(part)
  }
  return <span>{wrapperStack[wrapperStack.length - 1].children}</span>
}

interface TreeTextPartViewProps {
  children: Array<string | React.ReactElement>,
  opener: (
    | TreeTextPart.DummyRangeStart
    | TreeTextPart.OpenableStart
    | TreeTextPart.SelectableStart
  ),
  onUpdate: () => void,
  selectable: boolean,
}

const TreeTextPartView = observer(({ opener, children, onUpdate, selectable }: TreeTextPartViewProps) => {
  const state = useContext(ClientState.Context)
  if(opener.kind === "dummyRangeStart")
    return <>{children}</>
  if(opener.kind === "openableStart")
    return <NestableSpan
      className="openable"
      onClick={() => {
        opener.target.open = true
        onUpdate()
      }}
      children={children}
    />
  if(opener.kind === "selectableStart") {
    if(!selectable)
      return <>{children}</>
    const { path } = opener
    const selectionClass = findLast(state.selection() ?? [], x => Hash.equal(x.path, path))?.type ?? ""
    return <NestableSpan
      className={"selectable " + selectionClass}
      onClick={event => {
        if(event.ctrlKey || event.metaKey || event.altKey)
          state.selection([
            ...(state.selection.value ?? []),
            {
              type: event.altKey ? "exclude" : "include",
              path,
            },
          ])
        else
          state.selection([{
            type: "include",
            path,
          }])
      }}
      children={children}
    />
  }
  assertNever(opener)
})

/** Like [].find but it starts from the end */
function findLast<T>(array: T[], predicate: (value: T) => boolean){
  for(let i = array.length - 1; i >= 0; i--)
    if(predicate(array[i]))
      return array[i]
}
