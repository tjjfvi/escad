import { HierarchyPath } from "../HierarchyPath.ts";
import { State } from "./State.ts";

export type TreeText = TreeTextPart[];

export type TreeTextPart =
  | TreeTextPart.String
  | TreeTextPart.Ellipsis
  | TreeTextPart.RangeStart
  | TreeTextPart.RangeEnd;

export namespace TreeTextPart {
  // eslint-disable-next-line @typescript-eslint/ban-types
  export const String = (string: string): String => ({
    kind: "string",
    string,
  });
  export interface String {
    readonly kind: "string";
    readonly string: string;
  }

  export const Ellipsis = (target: State): Ellipsis => ({
    kind: "ellipsis",
    target,
  });
  export interface Ellipsis {
    readonly kind: "ellipsis";
    readonly target: State;
  }

  export const RangeStart = (range: TreeTextRange): RangeStart => ({
    kind: "rangeStart",
    range,
  });
  export interface RangeStart {
    readonly kind: "rangeStart";
    readonly range: TreeTextRange;
  }

  export const RangeEnd = (): RangeEnd => ({
    kind: "rangeEnd",
  });
  export interface RangeEnd {
    readonly kind: "rangeEnd";
  }
}

export type TreeTextRange =
  | TreeTextRange.Selectable
  | TreeTextRange.Dummy;

export namespace TreeTextRange {
  export const Dummy = (): Dummy => ({
    kind: "dummy",
  });
  export interface Dummy {
    readonly kind: "dummy";
  }

  export const Selectable = (path: HierarchyPath): Selectable => ({
    kind: "selectable",
    path,
  });
  export interface Selectable {
    readonly kind: "selectable";
    readonly path: HierarchyPath;
  }
}
