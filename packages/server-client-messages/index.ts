
export type ServerClientMessage =
  | ["ping"]
  | ["init", string, string]
  | ["shas", string[]]
  | ["paramDef", string | null]

export type ClientServerMessage =
  | ["init", string | null, string | null]
  | ["params", Buffer]
