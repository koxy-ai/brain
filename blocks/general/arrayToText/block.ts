import Koxy from "../../../processor/main.ts";
import ParamUiOptions from "../../../types/param-ui.ts";

type Params = {
  value: string[] | number[];
  joinOn: string;
};

const _name = "Array to text";
const _icon = "list";
const _description = "Join array to text";
const _hasResult = true;
const _result = "string";

const _param_value_ui: ParamUiOptions = {
  "placeholder": "Enter array...",
};

const _param_splitOn_ui: ParamUiOptions = {
  "placeholder": "Enter delimiter...",
};

export default async function arrayToText(
  { value, joinOn }: Params,
  window: Koxy,
) {
  try {
    const newValue = value.join(joinOn);
    await window.processResult({
      success: true,
      result: newValue,
    });
  } catch (_err: unknown) {
    await window.processResult({
      success: false,
      err: _err as string,
    });
  }
}
