
import { Context, Id } from "@escad/core"

export interface Smooth {
  readonly sides?: number,
  readonly angle?: number,
  readonly size?: number,
}

const smoothContextId = Id.create(__filename, "@escad/solids", "0", "SmoothContext");
export const smoothContext = new Context<Smooth>(smoothContextId, { sides: 16 })
