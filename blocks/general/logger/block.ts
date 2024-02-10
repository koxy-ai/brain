import Koxy from "../../../processor/main.ts";
import ParamUiOptions from "../../../types/param-ui.ts";

type Params = {
  value: unknown;
};

const _name = "Logger";
const _icon = "list";
const _description = "Log something to the console";

const _param_value_ui: ParamUiOptions = {
  "placeholder": "The value to log",
};

const log = (value: unknown) => {
  // console.log(value, typeof value);
  return value;
};

export default function logger({ value }: Params, window: Koxy): void {
  // console.log(value);
  log(value);

  window.processResult(window, {
    success: true,
  });
}
