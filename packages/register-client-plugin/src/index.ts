
import { HashSet } from "@escad/core";

export const registeredPlugins = new HashSet<PluginRegistration>();

export interface PluginRegistration {
  path: string,
}

export const registerPlugin = (registration: PluginRegistration) => {
  registeredPlugins.add(registration);
}
