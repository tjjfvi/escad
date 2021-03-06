import { ScopedId } from "./Id";

export interface Parameter<V> {
  readonly type: ScopedId<string>,
  readonly defaultValue: V,
  readonly name?: string,
  readonly desc?: string,
}

export const Parameter = {
  rename: <V, T extends Parameter<V>>(parameter: T, name: string): T => ({
    ...parameter,
    name,
  })
}
