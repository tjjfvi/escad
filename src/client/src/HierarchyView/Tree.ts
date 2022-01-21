
import { State } from "./State"
import { TreeText, TreeTextPart } from "./TreeText"

export type Tree = TreePart[]

export type TreePart =
  | TreePart.Line
  | TreePart.Block

export namespace TreePart {
  export const Line = (...text: TreeText | [TreeText]): Line => ({
    kind: "line",
    text: ([] as TreeText).concat(...text),
  })
  export interface Line {
    readonly kind: "line",
    readonly text: TreeText,
  }

  Line.String = (string: string) =>
    Line(TreeTextPart.String(string))

  export const Block = (data: Omit<Block, "kind">): Block => ({
    kind: "block",
    ...data,
  })
  export interface Block {
    readonly kind: "block",
    readonly state: State,
    readonly children: readonly Tree[],
    readonly joiner?: string,
    readonly forceOpenable?: boolean,
    readonly forceEllipsis?: boolean,
  }
}

