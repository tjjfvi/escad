export const replaceTsExtension = (url: string) =>
  url.replace(/\.tsx?$|(?<=\/[^/\.]*)$/, ".js");
export const getTranspiledUrl = (url: string) => `/${replaceTsExtension(url)}`;
