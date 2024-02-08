interface ParamUiOptions {
  field?: "input" | "select";
  type?: string;
  values?: unknown[];
  placeholder?: string;
  required?: boolean;
  default?: unknown;
  typeChange?: boolean;
}

export default ParamUiOptions;
