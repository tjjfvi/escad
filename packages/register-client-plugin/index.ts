
import path from "path";

export const registeredPlugins: PluginRegistration[] = [];

export interface PluginRegistration {
  path: string,
}

export const registerPlugin = (registration: PluginRegistration) => {
  if(!path.isAbsolute(registration.path))
    throw new Error("Plugin registration path must be absolute (use require.resolve)");
  registeredPlugins.push(registration);
}
