import Koxy from "../main.ts";
import Types from "../../types/types.ts";
import dynamicType from "./dynamicType.ts";

const envRegex = /\$env\[(.*?)\]/;
const varRegex = /\$var\[(.*?)\]/;
const resRegex = /\$res\[(.*?)\]/;

function mapJSON(window: Koxy, value: Record<string, unknown>, type: Types) {
  const processedObject: Record<string, unknown> = {};
  const processedArray: unknown[] = [];
  if (Array.isArray(value)) {
    for (const item of value) {
      const processedValue = dynamicValue(window, item, type);
      processedArray.push(processedValue);
    }
    return processedArray;
  }

  for (const key in value) {
    const item = value[key];
    const processedValue = dynamicValue(window, item, type);
    processedObject[key] = processedValue;
  }
  return processedObject;
}

export default function dynamicValue(
  window: Koxy,
  value: any,
  type: Types,
) {
  if (typeof value === "object") {
    if (value === null) {
      return null;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        value[value.indexOf(item)] = dynamicValue(window, item, type);
      }
      return value;
    }
    value = mapJSON(window, value as Record<string, unknown>, type);
    return value;
  }

  while (envRegex.test(value)) {
    const match = value.match(envRegex);

    if (!match) {
      continue;
    }

    const key = match[1];

    if (!window.env[key]) {
      window.throwError({
        err: `Environment variable "${key}" not found`,
      });
    }
    value = value.replace(envRegex, window.env[key] || "undefined");
    if (value === "undefined") {
      value = undefined;
    }
    continue;
  }

  while (varRegex.test(value)) {
    const match = value.match(varRegex);

    if (!match) {
      return value;
    }

    const key = match[1].split(".")[0];
    const variable = window.variables.get(key);

    if (!variable) {
      window.throwError({
        err: `Variable "${key}" not found`,
      });
      value = value.replace(varRegex, "undefined");
      if (value === "undefined") {
        value = undefined;
      }
      continue;
    }

    let typedValue = dynamicType(key, variable.value, variable.type) as any;
    value = dynamicReplace(varRegex, match, value, typedValue, type);
  }

  while (resRegex.test(value)) {
    const match = value.match(resRegex);

    if (!match) {
      return value;
    }

    const key = match[1].split(".")[0];
    const res = window.results.get(key);

    if (!res) {
      window.throwError({
        err: `Result "${key}" not found`,
      });
      value = value.replace(resRegex, "undefined");
      if (value === "undefined") {
        value = undefined;
      }
      continue;
    }

    const typedValue = dynamicType(key, res.value, res.type) as any;
    value = dynamicReplace(resRegex, match, value, typedValue, type);
  }

  return value;
}

function dynamicReplace(
  regex: RegExp,
  match: RegExpMatchArray,
  value: any,
  typedValue: any,
  type: Types,
) {
  if (typeof typedValue === "object" && match[1].includes(".")) {
    match[1].split(".").slice(1).forEach((k: string) => {
      if (typedValue && typedValue[k]) {
        typedValue = typedValue[k] as any;
      } else {
        typedValue = undefined;
      }
    });
  }
  if (
    typeof typedValue === "string" && !typedValue.startsWith('"') &&
    !typedValue.endsWith('"') &&
    type === "object"
  ) {
    typedValue = `"${typedValue}"`;
  }
  if (
    typeof typedValue !== "string" && typeof typedValue !== "number" &&
    typeof typedValue !== "boolean" && typedValue !== undefined
  ) {
    typedValue = JSON.stringify(typedValue);
  }
  value = value.replace(regex, typedValue);
  if (value == typedValue && type === "object") {
    value = JSON.parse(typedValue);
  }
  if (typeof value === "string" && Number(value)) {
    value = Number(value);
  }
  if (typeof value === "string" && value === "true") {
    value = true;
  }
  if (typeof value === "string" && value === "false") {
    value = false;
  }
  if (value === "undefined" && typedValue === undefined) {
    value = undefined;
  }

  return value;
}
