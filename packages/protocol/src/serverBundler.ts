
import { Messenger } from "@escad/messages";
import { PluginRegistration } from "@escad/register-client-plugin";

export interface BundleOptions {
  outDir: string,
  coreClientPath: string,
  watch?: boolean,
  clientPlugins: PluginRegistration[],
}

export type ServerBundlerMessengerShape = { /**/ };

export type BundlerServerMessengerShape = {
  bundle(options: BundleOptions): Promise<void>,
  onBundle(): AsyncIterable<void>,
}

export type ServerBundlerMessenger = Messenger<ServerBundlerMessengerShape, BundlerServerMessengerShape>;
export type BundlerServerMessenger = Messenger<BundlerServerMessengerShape, ServerBundlerMessengerShape>;
