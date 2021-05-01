
import { Hash } from "@escad/core"
import { Messenger } from "@escad/messages"
import { PluginRegistration } from "@escad/register-client-plugin"

export interface BundleOptions {
  outDir: string,
  coreClientPath: string,
  watch?: boolean,
  clientPlugins: readonly PluginRegistration[],
}

export type ServerBundlerShape = { /**/ }

export type BundlerServerShape = {
  bundle(options: BundleOptions): Promise<void>,
}

export type ServerBundlerEvents = {
  bundleStart: [],
  bundleFinish: [hash: Hash<unknown>],
}

export type ServerBundlerMessenger = Messenger<ServerBundlerShape, BundlerServerShape, ServerBundlerEvents>
export type BundlerServerMessenger = Messenger<BundlerServerShape, ServerBundlerShape, ServerBundlerEvents>
