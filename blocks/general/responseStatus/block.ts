import Koxy from "../../../processor/main.ts";
import ParamUiOptions from "../../../types/param-ui.ts";

type Params = {
  code: number;
};

const _name = "Response status";
const _icon = "text";
const _description = "Change the response status code.";

const _param_code_ui: ParamUiOptions = {
  "type": "number",
  "placeholder": "Enter status code...",
};

// change the response status code
export default async function responseStatus(
  { code }: Params,
  window: Koxy,
) {
  code = parseInt(code);

  if (isNaN(code)) {
    await window.processResult({
      success: false,
      error: "Invalid status code",
    });
    return;
  }

  window.status = code;
  await window.processResult({
    success: true,
  });
}
