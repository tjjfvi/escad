import React from "../deps/react.ts";
import { Id } from "../core/mod.ts";

export const IdView = ({ id }: { id: Id }) => <span className="Id">{id}</span>;
