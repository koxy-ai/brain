import Block from "./block.ts";

export type Operator = "=" | "!=" | "!" | "<" | ">" | "<=" | ">=";

type MainCondition = {
  type: "main";
  operator: Operator;
  operands: Block["inputs"];
};

type OtherCondition = {
  type: "other";
  logic: "and" | "or";
  operator: Operator;
  operands: Block["inputs"];
};

interface Condition {
  type: "condition";
  main: MainCondition;
  other?: OtherCondition[] | undefined;
  success?: string;
  failed?: string;
}

export default Condition;
