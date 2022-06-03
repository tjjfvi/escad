/** @jsxImportSource solid */
import { JSX } from "../deps/solid.ts";
import { mdiIcons } from "../deps/mdi.ts";

export type Icon = (props: { class?: string }) => JSX.Element;

interface IconProps {
  icon: Icon | null | undefined;
  class?: string;
}

export const Icon = (
  props: IconProps,
) =>
  () => (
    props.icon && <props.icon class={props.class} />
  );

export const mdi: {
  [
    K in keyof typeof mdiIcons as K extends `mdi${infer T}` ? Uncapitalize<T>
      : never
  ]: Icon;
} = new Proxy({}, {
  get: (target, key) => {
    if (key in target || typeof key === "symbol" || typeof key === "number") {
      return target[key as never];
    }
    const icon: Icon = (props) => (
      <svg viewBox="0 0 24 24" class={(props.class ?? "") + ` mdi ${key}`}>
        <path
          style="fill: currentColor"
          d={mdiIcons[("mdi" + key[0].toUpperCase() + key.slice(1)) as never]}
        />
      </svg>
    );
    return (target[key as never] as any) = icon;
  },
}) as any;
