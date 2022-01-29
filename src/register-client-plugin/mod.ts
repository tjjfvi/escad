export const registeredPlugins = new Set<string>();

export const registerPlugin = (url: string | URL) => {
  registeredPlugins.add(url.toString());
};
