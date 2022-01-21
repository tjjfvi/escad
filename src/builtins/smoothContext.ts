import { Context, Id } from "../core/mod.ts";

export interface Smooth {
  readonly sides?: number;
  readonly angle?: number;
  readonly size?: number;
}

const smoothContextId = Id.create(
  import.meta.url,
  "@escad/builtins",
  "Context",
  "SmoothContext",
);
export const smoothContext = new Context<Smooth>(smoothContextId, {
  sides: 16,
});
