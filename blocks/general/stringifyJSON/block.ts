import Koxy from "../../../processor/main.ts";
import ParamUiOptions from "../../../types/param-ui.ts";

type Params = {
  value: object;
};

const _name = "Stringify JSON";
const _icon = "code-minus";
const _description = "Stringify JSON to string";
const _hasResult = true;
const _result = "string";

const _param_value_ui: ParamUiOptions = {
  "placeholder": "Enter value to Stringify...",
};

export default async function parseJSON(
  { value }: Params,
  window: Koxy,
) {
  try {
    const stringValue = JSON.stringify(value);
    await window.processResult({
      success: true,
      result: stringValue,
    });
  } catch (_err: unknown) {
    await window.processResult({
      success: false,
      err: _err as string,
    });
  }
}
