import { Timer } from "./Timer.ts";

const ids = new Set<string>();

export declare const __id: unique symbol;
export type __id = typeof __id;
export type Id<
  P extends string = string,
  S extends string = string,
  N extends string = string,
> = string & { [__id]: [P, S, N] | undefined };

export const idRegex =
  /^(?<packageName>(?:@[\w-]+\/)?[\w-]+)\/(?<scope>\w+)\/(?<name>\w+)$/;

export type ScopedId<S extends string> = Id<string, S, string>;

export const Id = {
  create: <P extends string, S extends string, N extends string>(
    _filepath: string,
    packageName: P,
    scope: S,
    name: N,
  ): Id<P, S, N> => {
    const id = `${packageName}/${scope}/${name}`;
    if (!idRegex.test(id)) {
      throw new Error("Invalid id passed to Id.create: " + id);
    }
    // TODO: use filepath / validate packageName
    if (ids.has(id)) {
      throw new Error(`Duplicate ids created under ${id}`);
    }
    ids.add(id);
    return id as Id<P, S, N>;
  },
  tryParse: (id: string) => {
    const match = idRegex.exec(id);
    if (!match?.groups) return null;
    return match.groups as Record<"packageName" | "scope" | "name", string>;
  },
  parse: <P extends string, S extends string, N extends string>(
    id: Id<P, S, N>,
  ) => {
    const result = Id.tryParse(id);
    if (!result) {
      throw new Error("Invalid id passed to Id.parse");
    }
    return result as { packageName: P; scope: S; name: N };
  },
  isId: Timer.create().timeFn((id: unknown): id is Id =>
    typeof id === "string" && idRegex.test(id)
  ),
};
