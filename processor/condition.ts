import Koxy from "./main.ts";
import Condition, { Operator } from "../types/condition.ts";
import ConditionReturn, { DoneCondition, ErrorCondition } from "../types/condition-return.ts";
import dynamicInputs from "./dynamic/inputs.ts";

type ProcessLogicParams = {
  operator: Operator;
  operand1: unknown;
  operand2?: unknown;
};

const equal = (o1: unknown, o2: unknown) => (o1 === o2);
const notEqual = (o1: unknown, o2: unknown) => (o1 !== o2);

const smaller = (o1: unknown, o2: unknown) => (Number(o1) < Number(o2));
const smallerOrEq = (o1: unknown, o2: unknown) => (Number(o1) <= Number(o2));

const greater = (o1: unknown, o2: unknown) => (Number(o1) > Number(o2));
const greaterOrEq = (o1: unknown, o2: unknown) => (Number(o1) >= Number(o2));

const not = (o: unknown) => (!o);

function getOperation(operator: Operator) {
  if (operator === "=") return equal;
  if (operator === "!=") return notEqual;
  if (operator === "<") return smaller;
  if (operator === "<=") return smallerOrEq;
  if (operator === ">") return greater;
  if (operator === ">=") return greaterOrEq;
  if (operator === "!") return not;

  return null;
}

function processLogic({operator, operand1, operand2}: ProcessLogicParams) {
  const operation = getOperation(operator);

  if (!operation) {
    return false;
  }

  return operation(operand1, operand2);
}

function returnRes(
  res: boolean,
  success?: string,
  failed?: string,
): ConditionReturn {
  return {
    state: "done",
    target: res ? success : failed,
  };
}

export default function condition(window: Koxy, condition: Condition): ConditionReturn {
  const { main, other, success, failed } = condition;
  const res = { value: false };

  if (!main) {
    return {
      state: "error",
      msg: "Can't process the main condition",
    };
  }

  try {
    const { operator, operands } = main;
    const dynamicOperands = dynamicInputs(window, operands);

    res.value = processLogic({
      operator,
      operand1: Object.values(dynamicOperands)[0],
      operand2: Object.values(dynamicOperands)[1],
    });

    if (!other) {
      return returnRes(res.value, success, failed);
    }

    other.map((cond) => {
      const { operands, operator, logic } = cond;
      const dynamicOperands = dynamicInputs(window, operands);

      if (logic === "or" && res.value) {
        return;
      }

      if (logic === "and" && !res.value) {
        return;
      }

      res.value = processLogic({
        operator,
        operand1: Object.values(dynamicOperands)[0],
        operand2: Object.values(dynamicOperands)[1],
      });
    });

    return returnRes(res.value, success, failed);
  } catch (_err: unknown) {
    return {
      state: "error",
      msg: "Failed processing condition",
    };
  }
}
