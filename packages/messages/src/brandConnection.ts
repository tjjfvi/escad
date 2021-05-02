
import { Connection } from "./Connection"
import { filterConnection } from "./filterConnection"
import { transformConnection } from "./transformConnection"

export const brandConnection =
  (connection: Connection<{ brand: string, value: unknown }, unknown>, brand: string): Connection<unknown> =>
    transformConnection(
      filterConnection(
        connection,
        (v): v is { brand: string, value: unknown } =>
          typeof v === "object" && !!v && "brand" in v && v["brand" as never] === brand && "value" in v,
      ),
      value => ({ brand, value }),
      ({ value }) => value,
    )
