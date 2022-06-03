/** @jsxImportSource solid */
// @style "./stylus/NumberParam.styl"
import { createSignal } from "../deps/solid.ts";
import { NumberParam } from "../core/mod.ts";
import { NameDesc, registerParameter } from "./ParametersPane.tsx";

registerParameter<number, NumberParam>({
  id: NumberParam.id,
  class: "NumberParam",
  component: (props) => {
    const validate = (val: number) =>
      !(
        (isNaN(val)) ||
        (props.parameter.integer && Math.floor(val) !== val) ||
        (props.parameter.min !== undefined && val < props.parameter.min) ||
        (props.parameter.max !== undefined && val > props.parameter.max)
      );
    const [fieldValue, _setFieldValue] = createSignal(props.value + "");
    const valid = () => validate(+fieldValue());
    const setFieldValue = (value: string) => {
      _setFieldValue(value);
      if (validate(+value)) {
        props.setValue(+value);
      }
    };
    return (
      <>
        <NameDesc parameter={props.parameter} />
        <div class="NumberParam" classList={{ invalid: !valid() }}>
          <input
            type="text"
            value={fieldValue() || ""}
            onChange={(e) => setFieldValue(e.currentTarget.value)}
          />
          <div class="incDec">
            <div
              class="inc"
              onClick={() => setFieldValue((+fieldValue() + 1) + "")}
            >
            </div>
            <div
              class="dec"
              onClick={() => setFieldValue((+fieldValue() - 1) + "")}
            >
            </div>
          </div>
        </div>
      </>
    );
  },
});
