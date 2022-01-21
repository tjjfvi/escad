import { Connection } from "./Connection.ts";
import { transformConnection } from "./transformConnection.ts";

/* istanbul ignore next: covered by types, noisy to test */
export const logConnection = <T>(connection: Connection<T>): Connection<T> =>
  transformConnection(
    connection,
    (value) => {
      console.log("send", ...([] as unknown[]).concat(value));
      return value;
    },
    (value) => {
      console.log("recv", ...([] as unknown[]).concat(value));
      return value;
    },
  );
