/** @jsxImportSource solid */
// @style "./stylus/Status.styl"
import { Index } from "../deps/solid.ts";
import { Icon } from "./Icon.tsx";

export interface Status {
  class?: string;
  description: string;
  icon1?: Icon;
  icon2?: Icon;
  onClick?: () => void;
}

export const Statuses = (props: { statuses: Status[] }) => {
  return (
    <div class="Statuses">
      <Index each={props.statuses}>
        {(status) => <Status {...status()} />}
      </Index>
    </div>
  );
};

const Status = (status: Status) => {
  return (
    <div
      class="Status"
      classList={{
        [status.class ?? ""]: true,
        clickable: !!status.onClick,
      }}
      onClick={() => status.onClick?.()}
    >
      <div class="icons">
        {<Icon class="icon1" icon={status.icon1} />}
        {<Icon class="icon2" icon={status.icon2} />}
      </div>
      <span>{status.description}</span>
    </div>
  );
};
