export const registeredPlugins = new Set<string>();

export const registerClientPlugin = (url: string | URL) => {
  registeredPlugins.add(url.toString());
};
