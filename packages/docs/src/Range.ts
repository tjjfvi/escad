
export type Range = {
  start: number,
  end: number,
  info: RangeInfo[],
}

export type RangeInfo =
  | NewlineRangeInfo
  | HoverRangeInfo
  | ThemeRangeInfo
  | CollapseRangeInfo

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

export interface CollapseRangeInfo {
  type: "CollapseRangeInfo",
}

export type Ranges = Range[]
