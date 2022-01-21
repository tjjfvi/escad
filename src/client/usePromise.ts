import React from "../deps/react.ts";

export const usePromise = <T>(
  func: () => Promise<T>,
  deps: readonly unknown[],
) => {
  const [value, setValue] = React.useState<T>();
  let current = true;
  React.useEffect(() => {
    setValue(undefined);
    func().then((value) => current && setValue(value));
    return () => {
      current = false;
    };
  }, deps);
  return value;
};
