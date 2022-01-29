import React from "../deps/react.ts";
import { MdiIcon, mdiIcons } from "../deps/mdi.ts";

export type Icon = ((
  props: { className?: string },
) => React.ReactElement | null);

export const Icon = (props: { icon: Icon; className?: string }) => (
  <props.icon className={props.className} />
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
    const icon: Icon = ({ className }) => (
      <MdiIcon
        path={mdiIcons[("mdi" + key[0].toUpperCase() + key.slice(1)) as never]}
        className={(className ?? "") + ` mdi ${key}`}
      />
    );
    return (target[key as never] as any) = icon;
  },
}) as any;
