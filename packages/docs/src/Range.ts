
export type Range = {
  start: number,
  end: number,
  info: RangeInfo[],
}

export type RangeInfo =
  | NewlineRangeInfo
  | HoverRangeInfo
  | ScopeRangeInfo
  | CollapseRangeInfo

export interface NewlineRangeInfo {
  type: "NewlineRangeInfo",
  row: number,
}

export interface HoverRangeInfo {
  type: "HoverRangeInfo",
  hover: string,
}

export interface ScopeRangeInfo {
  type: "ScopeRangeInfo",
  scopes: string[],
}

export interface CollapseRangeInfo {
  type: "CollapseRangeInfo",
}

export type Ranges = Range[]
