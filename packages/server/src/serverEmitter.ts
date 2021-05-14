
import { createEventEmitter, EventEmitter } from "@escad/messages"
import { PluginRegistration } from "@escad/register-client-plugin"

export type ServerEmitter = EventEmitter<{
  changeObserved: [],
  clientPlugins: [plugins: readonly PluginRegistration[]],
}>

export const createServerEmitter = (): ServerEmitter => createEventEmitter()
