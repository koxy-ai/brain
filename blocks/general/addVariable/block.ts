import Koxy from "../../../processor/main.ts";
import ParamUiOptions from "../../../types/param-ui.ts";

type Params = {
  key: string;
  value: unknown;
  mutable: boolean;
};

const _name = "Add variable";
const _icon = "text";
const _description = "Add a global variable";

const _param_key_ui: ParamUiOptions = {
  "placeholder": "Enter variable key...",
};

const _param_value_ui: ParamUiOptions = {
  "placeholder": "Enter variable value...",
};

const _param_mutable_ui: ParamUiOptions = {
  "placeholder": "Can the variable value be mutated..?",
};

export default async function addVariable(
  { key, value, mutable }: Params,
  window: Koxy,
) {
  const exist = window.variables.get(key) || { mutable: true };
  if (!exist.mutable) {
    await window.processResult({
      success: false,
      err: `Can not mutate the immutable variable "${key}"`,
    });
    return;
  }

  try {
    value = JSON.parse(value as string);
  } catch (_err: unknown) {
    (() => {});
  }

  window.variables.set(key, {
    value: value,
    mutable: mutable || false,
  });

  await window.processResult({
    success: true,
  });
}
