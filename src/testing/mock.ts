type Mock<T extends (...args: any[]) => any> = T & { calls: Parameters<T>[] };

export function mock(): Mock<(...args: any[]) => void>;
export function mock<T extends (...args: any[]) => any>(impl: T): Mock<T>;
export function mock(
  impl?: (...args: any[]) => any,
): Mock<(...args: any[]) => any> {
  const calls: any[][] = [];
  const fn = (...args: any[]) => {
    calls.push(args);
    return impl?.(args);
  };
  fn.calls = calls;
  return fn;
}
