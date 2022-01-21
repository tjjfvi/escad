import { useEffect, useState } from "react.ts";

export const usePromise = <T>(
  func: () => Promise<T>,
  deps: readonly unknown[],
) => {
  const [value, setValue] = useState<T>();
  let current = true;
  useEffect(() => {
    setValue(undefined);
    func().then((value) => current && setValue(value));
    return () => {
      current = false;
    };
  }, deps);
  return value;
};
