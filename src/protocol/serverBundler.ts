
import { Hash } from "../core/mod.ts"
import { Messenger } from "../messages/mod.ts"
import { PluginRegistration } from "../register-client-plugin/mod.ts"

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
