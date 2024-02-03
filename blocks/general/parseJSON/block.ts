import Koxy from "../../../processor/main.ts";
import ParamUiOptions from "../../../types/param-ui.ts";

type Params = {
  value: unknown;
};

const _name = "Parse JSON";
const _icon = "code-dots";
const _description = "Parse data to JSON";
const _hasResult = true;
const _result = "object";

const _param_value_ui: ParamUiOptions = {
  "placeholder": "Enter value to parse...",
};

export default async function parseJSON(
  { value }: Params,
  window: Koxy,
) {
  if (typeof value === "object") {
    await window.processResult({
      success: true,
      result: value,
    });
    return;
  }

  try {
    value = JSON.parse(value as string);
    await window.processResult({
      success: true,
      result: value,
    });
  } catch (_err: unknown) {
    await window.processResult({
      success: false,
      err: _err as string,
    });
  }
}
