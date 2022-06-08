import { children, createMemo, JSX } from "../deps/solid.ts";

interface MemoShowProps<T> {
  when: T | null | false | undefined;
  children: (accessor: () => T) => JSX.Element;
  fallback?: JSX.Element;
}

export const MemoShow = <T,>(props: MemoShowProps<T>) => {
  const when = createMemo(() => props.when);
  const condition = createMemo(() => !!when());

  let lastVal: T | null = null;
  const val = createMemo(() => (lastVal = when() || lastVal));

  const memo = createMemo(() => {
    const cond = condition();
    if (cond) {
      return children(() => props.children(val as () => T));
    } else {
      return props.fallback;
    }
  });

  return memo as unknown as JSX.Element;
};
