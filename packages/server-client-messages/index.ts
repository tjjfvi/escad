
export type ServerClientMessage =
  | ["ping"]
  | ["init", string, string]
  | ["shas", string[]]

export type ClientServerMessage =
  | ["init", string | null, string | null]
