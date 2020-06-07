
export type ServerClientMessage =
  | ["init", string, string]
  | ["shas", string[]]

export type ClientServerMessage =
  | ["init", string, string]
