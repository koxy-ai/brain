import { Operation } from "../../types/block.ts";
import operation from "./operation.ts";
import Types from "../../types/types.ts";

type ModeHandler = (oldValue: any, newValue: any, type: Types) => unknown;

const modes: Record<string, ModeHandler> = {
  "add": (oldValue: any, newValue: any, type: Types) => {
    switch (type) {
      case "array":
        oldValue.push(newValue);
        return oldValue;
      case "object":
        oldValue = {
          ...oldValue,
          ...newValue,
        };
        return oldValue;
      case "string":
        return `${oldValue} ${newValue}`;
      case "number":
        return Number(oldValue) + Number(newValue);
      case "boolean":
        return Boolean(oldValue) || Boolean(newValue);
      default:
        return oldValue;
    }
  },
  "subtract": (oldValue: any, newValue: any, type: Types) => {
    switch (type) {
      case "array":
        oldValue = [
          ...Array(oldValue) || [],
          (typeof newValue === "object") ? newValue : [newValue],
        ];
        return oldValue;
      default:
        return [oldValue, newValue];
    }
  },
  "merge": (oldValue: any, newValue: any, type: Types) => {
    switch (type) {
      case "object":
        oldValue = {
          ...oldValue,
          ...newValue,
        };
        return oldValue;
      case "array":
        oldValue = [...oldValue, ...newValue];
        return oldValue;
      case "string":
        return `${oldValue} ${newValue}`;
      case "number":
        return Number(oldValue) + Number(newValue);
      default:
        return newValue;
    }
  },
  "filter": (oldValue: any, newValue: any, type: Types) => {
    switch (type) {
      case "array":
        oldValue = oldValue.filter((item: any) => item !== newValue);
        return oldValue;
      case "object":
        oldValue = {
          ...oldValue,
          ...newValue,
        };
        return oldValue;
      default:
        return oldValue;
    }
  },
};

export default function applyOperation(
  currentValue: any,
  type: Types,
  thisOperation: Operation,
) {
  const op = thisOperation.op;
  const value =
    (thisOperation.value === "self"
      ? currentValue
      : thisOperation.value) as unknown;
  const mode = thisOperation.mode || "replace";

  if (!op || !value || !mode) {
    return currentValue;
  }

  const newValue = operation(op, [value]);

  if (mode === "replace") {
    return newValue;
  }

  if (mode === "map") {
    switch (type) {
      case "array":
        currentValue = currentValue.map((item: any) => operation(op, item));
        return currentValue;
      default:
        return currentValue;
    }
  }

  const modeHandler = modes[mode];

  if (!modeHandler) {
    return currentValue;
  }

  try {
    return modeHandler(currentValue, newValue, type);
  } catch (_e) {
    return currentValue;
  }

  return currentValue;
}
