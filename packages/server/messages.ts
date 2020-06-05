import { B64 } from "@escad/core";

type RequestId = number;

type ServerRendererMessage =
  | ["artifactsDir", string]
  | ["load", string]
  | ["render", RequestId, B64]

type RendererServerMessage =
  | ["render", number, B64]
  | ["shas", B64[]]

type StreamId = number;

type ClientServerMessage =
  | ["init", string, string]
  | ["export", RequestId, B64, B64, string?]
  | ["render", RequestId, B64]

type ServerClientMessage =
  | ["ping"]
  | ["init", string, string]
  | ["export", RequestId, StreamId]
  | ["render", RequestId, StreamId]
  | ["stream", StreamId, number]

