import { createEventEmitter, EventEmitter } from "../messages/mod.ts";
import { PluginRegistration } from "../register-client-plugin/mod.ts";

export type ServerEmitter = EventEmitter<{
  changeObserved: [];
  clientPlugins: [plugins: readonly PluginRegistration[]];
}>;

export const createServerEmitter = (): ServerEmitter => createEventEmitter();
