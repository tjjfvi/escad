
declare global {
  export namespace escad {
    export interface Builtins { }
  }
}

export type Builtins = escad.Builtins;

export const builtins: Builtins = {};

type BuiltinsPartial = { [K in keyof Builtins]?: Builtins[K] };

export const extendBuiltins = (extension: BuiltinsPartial) => Object.assign(builtins, extension);

export default builtins;
