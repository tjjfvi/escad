import React from "../../react.ts";

export const useValue = <V>(v: () => V): V => React.useState(v)[0];
