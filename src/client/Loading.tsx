/** @jsxImportSource solid */
// @style "./stylus/Loading.styl"

export const Loading = (
  props: { class?: string; size?: number },
) => (
  <div
    class={"Loading " + (props.class ?? "")}
    style={props.size === undefined ? {} : { "--size": props.size + "px" }}
  />
);
