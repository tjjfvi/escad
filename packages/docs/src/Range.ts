
export type Range = {
  start: number,
  end: number,
  info: RangeInfo,
  children: Range[],
}

export type RangeInfo =
  | NullRangeInfo
  | NewlineRangeInfo
  | HoverRangeInfo
  | ThemeRangeInfo
  | EllipsisRangeInfo
  | CollapseRangeInfo

export interface NullRangeInfo {
  type: "NullRangeInfo",
}

export interface NewlineRangeInfo {
  type: "NewlineRangeInfo",
  row: number,
}

export interface HoverRangeInfo {
  type: "HoverRangeInfo",
  hover: string,
}

export interface ThemeRangeInfo {
  type: "ThemeRangeInfo",
  foreground: string | undefined,
  background: string | undefined,
  italic: boolean,
  bold: boolean,
  underline: boolean,
}

export interface EllipsisRangeInfo {
  type: "EllipsisRangeInfo",
  row: number,
}

export interface CollapseRangeInfo {
  type: "CollapseRangeInfo",
  row: number,
}

export type Ranges = Range[]
