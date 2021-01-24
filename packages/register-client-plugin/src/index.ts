
export const registeredPlugins: PluginRegistration[] = [];

export interface PluginRegistration {
  path: string,
}

export const registerPlugin = (registration: PluginRegistration) => {
  registeredPlugins.push(registration);
}
