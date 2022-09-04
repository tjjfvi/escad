/** @jsxImportSource solid */
import { createMemo, For } from "../../deps/solid.ts";
import { flattenTree } from "./flattenTree.ts";
import { finalizeTree } from "./finalizeTree.ts";
import { Tree, TreePart } from "./Tree.ts";
import { TreeText } from "./TreeText.ts";
import { TreeTextView } from "./TreeTextView.tsx";

const arrowWidth = 25;
const characterWidth = 10;

interface TreeViewProps {
  tree: Tree;
  width: number;
}
export const TreeView = (props: TreeViewProps) => {
  const innerWidth = () => props.width - arrowWidth;
  const maxLength = () => innerWidth() / characterWidth;

  const joinedCollapsedTree = createMemo(() =>
    finalizeTree(flattenTree(props.tree, maxLength()))
  );
  const expandableSections = createMemo(() =>
    getOpenableSections(
      props.tree,
      maxLength(),
    )
  );

  return (
    <div class="TreeNode">
      <For each={joinedCollapsedTree()}>
        {(part, i) => () => {
          const prev = joinedCollapsedTree()[i() - 1];
          const next = joinedCollapsedTree()[i() + 1];

          if (part.kind === "block") {
            return (
              <div class="block">
                {part.children.map((y, i) => (
                  <TreeView
                    width={innerWidth()}
                    tree={y}
                  />
                ))}
              </div>
            );
          }

          if (next && next.kind === "block") {
            return (
              <Line
                arrowState="open"
                text={part.text}
                onClick={() => next.state.open = false}
              />
            );
          }

          const sectionsSplitInd = prev?.kind === "block"
            ? expandableSections().findIndex((v) => v.state === prev.state) +
              1
            : 0;
          const relevantSections = expandableSections().slice(
            sectionsSplitInd,
          );

          if (!relevantSections.length) {
            return (
              <Line
                arrowState="leaf"
                text={part.text}
              />
            );
          }

          return (
            <Line
              arrowState="closed"
              text={part.text}
              onClick={() => {
                relevantSections.forEach((x) => x.state.open = true);
              }}
            />
          );
        }}
      </For>
    </div>
  );
};

type LineProps = {
  arrowState: "leaf" | "open" | "closed";
  text: TreeText;
  onClick?: () => void;
};

const Line = (props: LineProps) => (
  <div class="line" onDblClick={props.onClick}>
    <div class={"arrow " + props.arrowState} onClick={props.onClick}></div>
    <TreeTextView
      text={props.text}
    />
  </div>
);

function getOpenableSections(tree: Tree, maxLength: number) {
  return flattenTree(tree, maxLength, false)
    .filter((part): part is TreePart.Block => part.kind === "block")
    .filter((part) => part.children.length > 0);
}
