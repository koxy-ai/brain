import Koxy from "../../../processor/main.ts";
import ParamUiOptions from "../../../types/param-ui.ts";

type Params = {
  value: string;
  splitOn: string;
};

const _name = "Text to array";
const _icon = "brackets";
const _description = "Make array from text";
const _hasResult = true;
const _result = "array";

const _param_value_ui: ParamUiOptions = {
  "placeholder": "Enter text to make array...",
};

const _param_splitOn_ui: ParamUiOptions = {
  "placeholder": "Enter delimiter...",
};

export default async function textToArray(
  { value, splitOn }: Params,
  window: Koxy,
) {
  try {
    const arr = value.split(splitOn);
    await window.processResult({
      success: true,
      result: arr,
    });
  } catch (_err: unknown) {
    await window.processResult({
      success: false,
      err: _err as string,
    });
  }
}
