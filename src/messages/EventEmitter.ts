import { createMessenger } from "./Messenger.ts";
import { EventsShape, Messenger } from "./Messenger.ts";

export type EventEmitter<E extends EventsShape> = Omit<
  Messenger<{}, {}, E>,
  "impl" | "retryAll"
>;

/* istanbul ignore next: covered by types, not much to test */
export const createEventEmitter = <E extends EventsShape>(): EventEmitter<E> =>
  createMessenger({
    impl: {},
    connection: {
      send: () => {},
      onMsg: () => () => {},
    },
  });
