import { clientId } from "./swApi.ts";

export const getTranspiledUrl = (url: string) => {
  if (url.startsWith(location.origin + `/${clientId}/`)) {
    return location.origin + `/${clientId}/transpiled/` +
      url.slice((location.origin + `/${clientId}/`).length);
  }
  return location.origin + "/transpiled/" + url;
};
