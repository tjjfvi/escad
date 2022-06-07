/** @jsxImportSource solid */
// @style "./stylus/BooleanParam.styl"
import { BooleanParam } from "../core/mod.ts";
import { NameDesc, registerParameter } from "./ParametersPane.tsx";

registerParameter<boolean, BooleanParam>({
  id: BooleanParam.id,
  class: "BooleanParam",
  component: (props) => (
    <>
      <NameDesc parameter={props.parameter} />
      <div class="checkbox">
        <label>
          <input
            type="checkbox"
            checked={props.value}
            onChange={() => props.setValue(!props.value)}
          />
          <div />
        </label>
      </div>
    </>
  ),
});
