
declare global {
  export namespace escad {
    export interface Chainables { }
  }
}

export type Chainables = escad.Chainables;

export const chainables: Chainables = {};

export const extendChainables = (extension: Partial<Chainables>) => Object.assign(chainables, extension);
