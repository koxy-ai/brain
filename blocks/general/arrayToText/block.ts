import Koxy from "../../../processor/main.ts";
import ParamUiOptions from "../../../types/param-ui.ts";

type Params = {
  value: unknown[];
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

export default async function parseJSON(
  { value, joinOn }: Params,
  window: Koxy,
) {

  try {
    value = value.join(joinOn);
    await processResult({
      success: true,
      result: value,
    });
  } catch (_err: unknown) {
    await processResult({
      success: false,
      err: _err,
    });
  }
  
}
