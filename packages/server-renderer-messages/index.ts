import { B64 } from "@escad/core";

export type ServerRendererMessage =
  | ["artifactsDir", string]
  | ["load", string]

export type RendererServerMessage =
  | ["shas", B64[]]
