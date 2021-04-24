
import { State } from "./State"
import { TreeText, TreeTextPart } from "./TreeText"

export type Tree = TreePart[]

export type TreePart =
  | TreePart.Text
  | TreePart.Children

export namespace TreePart {
  export const Text = (...text: TreeText | [TreeText]): Text => ({
    kind: "text",
    text: ([] as TreeText).concat(...text),
  })
  export interface Text {
    readonly kind: "text",
    readonly text: TreeText,
  }

  Text.String = (string: string) =>
    Text(TreeTextPart.String(string))

  export const Children = (data: Omit<Children, "kind">): Children => ({
    kind: "children",
    ...data,
  })
  export interface Children {
    readonly kind: "children",
    readonly state: State,
    readonly children: readonly Tree[],
    readonly joiner?: string,
    readonly forceOpenable?: boolean,
    readonly forceEllipsis?: boolean,
  }
}

