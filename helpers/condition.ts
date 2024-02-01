import Condition, { Operator } from "../types/condition.ts";

type ProcessLogicParams = {
    operator: Operator,
    operand1: unknown,
    operand2?: unknown
}

type DoneCondition = {
    state: "done",
    target: string | undefined
}

type ErrorCondition = {
    state: "error",
    msg?: string
}

type ConditionReturn = DoneCondition | ErrorCondition;

const equal = (o1: unknown, o2: unknown) => ( (o1 === o2) );
const notEqual = (o1: unknown, o2: unknown) => ( (o1 !== o2) );

const smaller = (o1: unknown, o2: unknown) => ( (Number(o1) < Number(o2)) );
const smallerOrEq = (o1: unknown, o2: unknown) => ( (Number(o1) <= Number(o2)) );

const greater = (o1: unknown, o2: unknown) => ( (Number(o1) > Number(o2)) );
const greaterOrEq = (o1: unknown, o2: unknown) => ( (Number(o1) >= Number(o2)) );

const not = (o: unknown) => ( (!o) );

function getOperation (operator: Operator) {

    if (operator === "=") return equal;
    if (operator === "!=") return notEqual;
    if (operator === "<") return smaller;
    if (operator === "<=") return smallerOrEq;
    if (operator === ">") return greater;
    if (operator === ">=") return greaterOrEq;
    if (operator === "!") return not;

    return null;

}

function processLogic(params: ProcessLogicParams) {

    const { operator, operand1, operand2 } = params;

    const operation = getOperation(operator);

    if (!operation) {
        return false;
    }

    return operation(operand1, operand2);

}

function returnRes(res: boolean, success?: string, failed?: string): ConditionReturn {

    return {
        state: "done",
        target: (res) ? success : failed
    }

}

export default function condition(condition: Condition): ConditionReturn {

    const { main, other, success, failed } = condition;
    const res = { value: false };

    if (!main) {
        return {
            state: "error",
            msg: "Can't process main"
        }
    }

    try {

        const { operator, operand1, operand2 } = main;

        res.value = processLogic({
            operator,
            operand1,
            operand2
        })

        if (!other) {
            return returnRes(res.value, success, failed);
        }

        other.map(cond => {

            const { operand1, operand2, operator, logic } = cond;

            if (logic === "or" && res.value) {
                return;
            }

            res.value = processLogic({
                operator,
                operand1,
                operand2
            })

        })

        return returnRes(res.value, success, failed);

    }

    catch(_err: unknown) {
        return {
            state: "error",
            msg: "Failed processing condition"
        }
    }

}
