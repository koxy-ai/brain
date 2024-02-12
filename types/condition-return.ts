interface DoneCondition {
  state: "done";
  target: string | undefined;
}

interface ErrorCondition {
  state: "error";
  msg?: string;
}

type ConditionReturn = DoneCondition | ErrorCondition;

export { type DoneCondition, type ErrorCondition };
export default ConditionReturn;
