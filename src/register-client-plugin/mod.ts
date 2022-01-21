import { HashSet } from "../core/mod.ts";

export const registeredPlugins = new HashSet<PluginRegistration>();

export interface PluginRegistration {
  path: string;
}

export const registerPlugin = (registration: PluginRegistration) => {
  registeredPlugins.add(registration);
};
