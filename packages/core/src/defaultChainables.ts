
declare global {
  export namespace escad {
    export interface DefaultChainables { }
  }
}

export type DefaultChainables = escad.DefaultChainables;

export const defaultChainables: DefaultChainables = {};

export const extendChainables = (extension: Partial<DefaultChainables>) => Object.assign(defaultChainables, extension);
