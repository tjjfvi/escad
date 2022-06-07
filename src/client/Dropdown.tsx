/** @jsxImportSource solid */
// @style "./stylus/Dropdown.styl"
import { For } from "../deps/solid.ts";

export interface DropdownProps<T> {
  options: Record<string, T>;
  value: T;
  setValue: (value: T) => void;
}

export const Dropdown = <T,>(props: DropdownProps<T>) => {
  const key = () => {
    const key = Object.entries(props.options).find(([, v]) => v === props.value)
      ?.[0];
    if (!key) throw new Error("Value passed to Dropdown not in options");
    return key;
  };
  return (
    <div class="Dropdown">
      <select
        value={key()}
        onChange={(event) =>
          props.setValue(props.options[event.currentTarget.value])}
      >
        <For each={Object.keys(props.options)}>
          {(key) => <option value={key}>{key}</option>}
        </For>
      </select>
    </div>
  );
};
