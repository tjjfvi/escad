/** @jsxImportSource solid */
// @style "./stylus/Pane.styl"

import {
  children as resolveChildren,
  createSignal,
  JSX,
  Show,
} from "../deps/solid.ts";

export type PaneArgs = {
  name: string;
  class?: string;
  children: JSX.Element;
  side: "left" | "right";
  defaultWidth?: number;
  resizable?: boolean;
  defaultOpen?: boolean;
  minWidth?: number;
};

export const Pane = (props: PaneArgs) => {
  const minWidth = () => props.minWidth ?? 100;
  const resizable = () => props.resizable ?? true;

  const [open, setOpen] = createSignal(props.defaultOpen ?? false);
  const [resizing, setResizing] = createSignal(false);
  const [_width, setWidth] = createSignal(props.defaultWidth ?? 500);
  const width = () => Math.max(_width(), minWidth());

  const children = resolveChildren(() => props.children);

  return (
    <Show when={children()}>
      <div
        class="Pane"
        classList={{
          [props.side]: true,
          open: open(),
          resizing: resizing(),
          resizable: resizable() && open(),
          [props.class ?? ""]: true,
        }}
        style={{ "max-width": `${open() ? width() : 50}px` }}
      >
        <div
          class="border"
          onMouseDown={() => {
            if (!resizable() || !open()) return;
            setResizing(true);
            const mouseMoveHandler = (e: MouseEvent) => {
              if (e.buttons) {
                setWidth((w) =>
                  w + e.movementX * (props.side === "left" ? 1 : -1)
                );
              } else {
                document.documentElement.removeEventListener(
                  "mousemove",
                  mouseMoveHandler,
                );
                setResizing(false);
                if (width() < minWidth()) {
                  setWidth(minWidth());
                }
              }
            };
            document.documentElement.addEventListener(
              "mousemove",
              mouseMoveHandler,
            );
          }}
        />
        <div class="side" onClick={() => setOpen((o) => !o)}>
          <span>{props.name}</span>
        </div>
        <div
          class="content"
          style={{ "min-width": `${width() - 50}px` }}
        >
          {children()}
        </div>
      </div>
    </Show>
  );
};
