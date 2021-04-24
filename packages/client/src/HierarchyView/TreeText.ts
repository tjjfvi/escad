
import { HierarchyPath } from "../HierarchyPath"
import { State } from "./State"

export type TreeText = TreeTextPart[]

export type TreeTextPart =
  | TreeTextPart.String
  | TreeTextPart.Ellipsis
  | TreeTextPart.DummyRangeStart
  | TreeTextPart.SelectableStart
  | TreeTextPart.OpenableStart
  | TreeTextPart.RangeEnd

export namespace TreeTextPart {
  // eslint-disable-next-line @typescript-eslint/ban-types
  export const String = (string: string): String => ({
    kind: "string",
    string,
  })
  export interface String {
    readonly kind: "string",
    readonly string: string,
  }

  export const Ellipsis = (): Ellipsis => ({
    kind: "ellipsis",
  })
  export interface Ellipsis {
    readonly kind: "ellipsis",
  }

  // Used to easily filter out ranges
  export const DummyRangeStart = (): DummyRangeStart => ({
    kind: "dummyRangeStart",
  })
  export interface DummyRangeStart {
    readonly kind: "dummyRangeStart",
  }

  export const SelectableStart = (path: HierarchyPath): SelectableStart => ({
    kind: "selectableStart",
    path,
  })
  export interface SelectableStart {
    readonly kind: "selectableStart",
    readonly path: HierarchyPath,
  }

  export const OpenableStart = (target: State): OpenableStart => ({
    kind: "openableStart",
    target,
  })
  export interface OpenableStart {
    readonly kind: "openableStart",
    readonly target: State,
  }

  export const RangeEnd = (): RangeEnd => ({
    kind: "rangeEnd",
  })
  export interface RangeEnd {
    readonly kind: "rangeEnd",
  }
}
