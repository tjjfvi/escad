export function transformUrl(url: string) {
  return url
    .replace(/[?#]/g, "_")
    .replace(/\.\./g, "__")
    .replace(/\.tsx?$|(?<!\.[^\W\d]+)$/, ".js")
    .replace(/\.styl$/, ".css");
}
