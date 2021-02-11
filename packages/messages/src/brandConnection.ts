
import { Connection } from "./Connection";
import { filterConnection } from "./filterConnection";
import { mapConnection } from "./mapConnection";

export const brandConnection =
  (connection: Connection<unknown>, brand: string): Connection<unknown> =>
    mapConnection(
      filterConnection(
        connection,
        (v): v is { brand: string, value: unknown } =>
          typeof v === "object" && !!v && "brand" in v && v["brand" as never] === brand && "value" in v
      ),
      value => ({ brand, value }),
      ({ value }) => value,
    )
