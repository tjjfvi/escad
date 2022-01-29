import React from "../../deps/react.ts";

export interface NestableSpanProps {
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
  children: React.ReactNode;
}

/**
 * Correctly handles hover & click logic when nested
 */
export const NestableSpan = (
  { className, onClick, children }: NestableSpanProps,
) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <span
      className={(className ?? "") + (hovered ? " hover" : "")}
      onClick={onClick && ((event) => {
        if (!onClick) return;
        event.stopPropagation();
        onClick(event);
      })}
      onMouseOver={(event) => {
        const newHovered = !handledMoverOverEvents.has(event.nativeEvent);
        if (hovered !== newHovered) setHovered(newHovered);
        handledMoverOverEvents.add(event.nativeEvent);
      }}
      onMouseLeave={() => hovered && setHovered(false)}
      children={children}
    />
  );
};

const handledMoverOverEvents = new WeakSet<MouseEvent>();
