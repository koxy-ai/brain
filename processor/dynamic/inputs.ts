import Koxy from "../main.ts";
import Block from "../../types/block.ts";
import dynamicValue from "./dynamicValue.ts";
import dynamicType from "./dynamicType.ts";
import jsonLogic from "npm:json-logic-js";
import applyOperation from "./applyOperation.ts";

export default function dynamicInputs(
  window: Koxy,
  inputs: Block["inputs"],
) {
  const keys = Object.keys(inputs);
  const res: Record<string, { value: string }> = {};

  for (const key of keys) {
    const input = inputs[key];
    const { value, type, operations } = input;
    const typedValue = dynamicType(key, value, type);
    let realValue = dynamicValue(window, typedValue, type);
    for (const operation of operations ?? []) {
      const newValue = applyOperation(realValue, type, operation);
      realValue = dynamicType(key, newValue, type);
      realValue = dynamicValue(window, realValue, type);
    }
    (res as any)[key] = realValue;
  }

  return res;
}
