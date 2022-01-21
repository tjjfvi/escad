import { Connection } from "./Connection.ts";
import { filterConnection } from "./filterConnection.ts";
import { transformConnection } from "./transformConnection.ts";

export const brandConnection = (
  connection: Connection<{ brand: string; value: unknown }, unknown>,
  brand: string,
): Connection<unknown> =>
  transformConnection(
    filterConnection(
      connection,
      (v): v is { brand: string; value: unknown } =>
        typeof v === "object" && !!v && "brand" in v &&
        v["brand" as never] === brand && "value" in v,
    ),
    (value) => ({ brand, value }),
    ({ value }) => value,
  );
