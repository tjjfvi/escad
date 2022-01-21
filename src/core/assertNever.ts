export function assertNever(
  value: never,
  message: (str: string) => string = (str) => `Expected never, got ${str}`,
): never {
  // TODO: feed message value with Deno.inspect
  throw new Error(message(""));
}
