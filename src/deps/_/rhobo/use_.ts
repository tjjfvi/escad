import { Readable } from "./readable.ts";
import { useValue } from "./useValue.ts";
import React from "../../react.ts";

type use_<F> = F & { use: F; preserve: F & { use: F } };

export const use_ = <F extends (...a: any[]) => Readable<unknown>>(
  f: F,
): use_<F> => {
  let core = (clear: boolean) =>
    (...a: unknown[]) => {
      let r = useValue(() => f(...a));
      if (clear) {
        React.useEffect(() =>
          () => {
            r.kill();
          }, []);
      }
      return r;
    };
  // @ts-ignore
  return Object.assign(
    core(true),
    {
      use: (...a: unknown[]) => core(true)(...a).use(),
      preserve: Object.assign(
        core(false),
        { use: (...a: unknown[]) => core(false)(...a).use() },
      ),
    },
  );
};
