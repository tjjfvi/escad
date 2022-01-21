export const escadPackageNames = [
  "builtins",
  // "cli",
  "client",
  // "bundler",
  "client-builtins",
  "core",
  "register-client-plugin",
  "renderer",
  "server",
  "protocol",
  "messages",
];

export const escadPackageTgzs = escadPackageNames.map((x) => `escad-${x}.tgz`);
export const escadPackages = escadPackageNames.map((x) => `@escad/${x}`);
