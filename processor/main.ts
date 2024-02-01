/*
    Represents a flow processor for executing a series of steps defined in a flow diagram.
*/

import Block from "../types/block.ts";
import Pointer from "../types/pointer.ts";
import Condition from "../types/condition.ts";
import general from "../blocks/general/index.ts";
import BlockReturn, { FailedReturn, SuccessReturn } from "../types/block-return.ts";
import FlowMap from "../types/map.ts";

interface Result {
    status: number,
    reason: "complete" | "error",
    result?: unknown,
    errors?: { position: string, err: string }[],
    took: number
}

// deno-lint-ignore ban-types
const sources: Record<string, Record<string, Function>> = {
    general
}

const map: FlowMap = {

    start: {
        type: "pointer",
        target: "addvar1"
    },

    addvar1: {
        type: "block",
        source: "general/addVariable",
        inputs: {
            key: {
                value: "obj",
                type: "string"
            },
            value: {
                value: `{"date": "Koxy.env(VARIABLE)"}`,
                type: "object"
            }
        },
        next: {
            success: "log1"
        }
    },

    log1: {
        type: "block",
        source: "general/logger",
        inputs: {
            value: {
                value: "Hello from Koxy.var(obj)",
                type: "string"
            }
        },
        next: {
            success: "log2"
        }
    },

    log2: {
        type: "block",
        source: "general/logger",
        inputs: {
            value: {
                value: "Hello from Koxy.env(VARIABLE)",
                type: "string"
            }
        },
        next: {
            success: "addvar"
        }
    },

    addvar: {
        type: "block",
        source: "general/addVariable",
        inputs: {
            key: {
                value: "date",
                type: "string"
            },
            value: {
                value: `{"date": "Date.now()"}`,
                type: "object"
            }
        },
        next: {}
    }

}

class Koxy {

    private map: FlowMap;
    private env: Record<string, unknown> = { VARIABLE: "3" };
    public variables = new Map<string, { value: unknown, mutable: boolean }>();
    private startAt: number;

    private results = new Map<string, unknown>();
    private errors: { position: string, err: string }[] = [];

    public prevPosition: string;
    public position: string;
    public next: { success?: string, failed?: string } = {};

    public stopReason: "complete" | "error" = "error";
    public status = 200;
    public res: undefined | Record<string, unknown> = undefined;

    constructor(map: FlowMap) {
        this.map = map;
        this.position = "start";
        this.prevPosition = "start";
        this.startAt = Date.now();
    }

    // start running the flow.
    async start() {
        await this.controller(this.position);

        return {
            status: this.status,
            reason: this.stopReason,
            result: this.res,
            errors: this.errors,
            took: Date.now() - this.startAt
        }

    }

    stop(isError?: boolean) {

        if (!isError) {
            this.stopReason = "complete";
        }

        return;
    }

    // controls what to do next based on the position
    // also used to update the new global new and prev positions
    async controller(position: string) {
        this.prevPosition = this.position;
        this.position = position;
        const block = this.map[position];

        if (!block) {
            this.throwError({
                err: `position "${position}" not found`,
                position: this.prevPosition,
                stop: true
            });
            return;
        }

        if (block.type === "pointer") {
            return this.process.pointer(block);
        }

        if (block.type === "condition") {
            return;
        }

        await this.process.block(block);
    }

    process = {

        pointer: ({ target }: Pointer) => {
            this.controller(target);
        },

        block: async (block: Block) => {
            const { source, inputs, next } = block;
            const action = this.getSource(source);

            if (!action || typeof action !== "function") {
                return this.throwError({ err: "source not valid", stop: true });
            }

            this.next = next;
            await action(this.inputs.process(inputs), this);
        }

    }

    async processResult(res: BlockReturn) {

        const next = this.next;

        if (!res) {
            return this.throwError({ err: "source return is invalid", stop: true });
        }

        if (next?.success === this.position || next?.failed === this.position) {
            return this.throwError({ err: "Loop detected: A block can't point to itself", stop: true });
        }

        if (res.success === false) {
            await this.processFailure(res, next?.failed);
            return;
        }

        await this.processSuccess(res, next?.success);

    }

    async processSuccess(res: SuccessReturn, next: string | undefined) {
        if (res.result) {
            this.results.set(this.position, res);
        }

        if (next) {
            await this.controller(next);
            return;
        }

        this.stop();
        return;
    }

    async processFailure(res: FailedReturn, next: string | undefined) {
        if (next) {
            await this.controller(next);
            return;
        }

        this.throwError({ err: res.err || "Unexpected error" });

        this.stop();
        return;
    }

    // deno-lint-ignore ban-types
    getSource(source: string): null | Function {
        if (!source) {
            return this.throwError({ err: "Block source is invalid", stop: true });
        }

        const [category, method] = source.split("/");
        const action = sources[category][method];

        return action;
    }

    inputs = {

        process: (inputs: Record<string, Record<string, unknown>>) => {
            const processedInputs: Record<string, unknown> = {};

            Object.keys(inputs).forEach(key => {
                const value = this.inputs.dynamic(inputs[key].value as string);
                processedInputs[key] = value;
            })

            return processedInputs;
        },

        dynamic: (value: string) => {
            if (typeof value !== "string") {
                return value;
            }

            const envRegex = /Koxy\.env\(([^)]+)\)/g;
            const varRegex = /Koxy\.var\(([^)]+)\)/g;

            while (envRegex.test(value)) {
                value = value.replace(envRegex, this.inputs.getEnv);
            }

            while (varRegex.test(value)) {
                value = value.replace(varRegex, this.inputs.getVar);
            }

            return value;
        },

        getEnv: (_: string, key: string) => {
            const value = this.env[key];
            if (!value) {
                this.throwError({ err: `Environment variable "${key}" not found` });
                return "undefined";
            }

            return value as string;
        },

        getVar: (_: string, key: string) => {
            const variable = this.variables.get(key);
            if (!variable) {
                this.throwError({ err: `Variable "${key}" not found` });
                return "undefined";
            }

            if (typeof variable.value === "object") {
                return JSON.stringify(variable.value);
            }

            return variable.value as string;
        }

    }

    throwError({ err, position, stop }: { err: string, position?: string, stop?: boolean }) {
        this.errors.push({
            err,
            position: position || this.position
        });

        if (stop) {
            this.status = 500;
            this.stop(true);
        }

        return null;
    }

}

export {map, type Result};
export default Koxy;