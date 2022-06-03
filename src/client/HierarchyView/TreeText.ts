import { JSX } from "../../deps/solid.ts";
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

  export const RangeStart = (
    component: RangeStart["component"],
  ): RangeStart => ({
    kind: "rangeStart",
    component,
  });
  export interface RangeStart {
    readonly kind: "rangeStart";
    readonly component: (props: { children: JSX.Element }) => JSX.Element;
  }

  export const RangeEnd = (): RangeEnd => ({
    kind: "rangeEnd",
  });
  export interface RangeEnd {
    readonly kind: "rangeEnd";
  }
}
