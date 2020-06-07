import { B64 } from "@escad/core";

export type RequestId = string;

export type ServerRendererMessage =
  | ["artifactsDir", string]
  | ["load", string]
  | ["export", RequestId, B64, B64]

export type RendererServerMessage =
  | ["shas", B64[]]
  | ["exportFinish", RequestId]
