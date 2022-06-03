/** @jsxImportSource solid */
import { createSignal, JSX } from "../../deps/solid.ts";

export interface NestableSpanProps {
  class?: string;
  onClick?: (event: MouseEvent) => void;
  children: JSX.Element;
}

/**
 * Correctly handles hover & click logic when nested
 */
export const NestableSpan = (props: NestableSpanProps) => {
  const [hovered, setHovered] = createSignal(false);
  return (
    <span
      classList={{
        [props.class ?? ""]: true,
        hover: hovered(),
      }}
      onClick={(event) => {
        if (!props.onClick) return;
        event.stopPropagation();
        props.onClick(event);
      }}
      onMouseOver={(event) => {
        const newHovered = !handledMoverOverEvents.has(event);
        setHovered(newHovered);
        handledMoverOverEvents.add(event);
      }}
      onMouseLeave={() => setHovered(false)}
      children={props.children}
    />
  );
};

const handledMoverOverEvents = new WeakSet<MouseEvent>();
