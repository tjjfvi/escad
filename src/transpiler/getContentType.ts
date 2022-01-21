import { contentType } from "https://deno.land/x/media_types/mod.ts";

export function getContentType(ext: string) {
  if (ext === ".styl") return contentType(".css")!;
  if (ext === ".ts") return contentType(".js")!;
  return contentType(ext) ?? contentType(".js")!;
}
