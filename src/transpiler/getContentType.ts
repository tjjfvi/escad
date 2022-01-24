import { contentType } from "../deps/media_types.ts";

export function getContentType(ext: string) {
  if (ext === ".styl") return contentType(".css")!;
  if (ext === ".ts") return contentType(".js")!;
  return contentType(ext) ?? contentType(".js")!;
}
