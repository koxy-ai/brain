/*
    Represents a flow processor for executing a series of steps defined in a flow diagram.
*/

import Block from "../types/block.ts";
import Pointer from "../types/pointer.ts";
import Condition from "../types/condition.ts";
import general from "../blocks/general/index.ts";
import FlowMap from "../types/map.ts";
import processResult from "./results/process.ts";
import processSuccess from "./results/success.ts";
import processFailure from "./results/fail.ts";
import dynamicInputs from "./dynamic/inputs.ts";
import type Types from "../types/types.ts";

interface Result {
  status: number;
  reason: "complete" | "error";
  result?: unknown;
  errors?: { position: string; err: string }[];
  took: number;
}

// deno-lint-ignore ban-types
const sources: Record<string, Record<string, Function>> = {
  general,
};

const map: FlowMap = {
  start: {
    type: "pointer",
    target: "addvar1",
  },

  addvar1: {
    type: "block",
    source: "general/addVariable",
    inputs: {
      key: {
        value: "obj",
        type: "string",
      },
      value: {
        value: "4",
        type: "number",
        operations: [
          { op: "Math.random", mode: "replace" },
        ],
      },
      mutable: {
        value: "true",
        type: "boolean",
      },
    },
    next: {
      success: "log1",
    },
  },

  log1: {
    type: "block",
    source: "general/logger",
    inputs: {
      value: {
        value:
          '{"a": {"b": {"c": ["$res[my result.0]", "$var[obj]", "$var[default.i]"] } } }',
        type: "object",
      },
    },
    next: {},
  },
};

class Koxy {
  private map: FlowMap;
  public env: Record<string, string> = { VARIABLE: "3" };
  public variables = new Map<
    string,
    { value: unknown; mutable: boolean; type: Types }
  >(
    [
      ["default", { value: { i: 55 }, mutable: true, type: "object" }],
    ],
  );

  private startAt: number;
  public results = new Map<
    string,
    { success: boolean; value: unknown; type: Types }
  >([
    ["my result", { success: true, value: ["It's a result"], type: "array" }],
  ]);
  private errors: { position: string; err: string }[] = [];
  private warnings: { position: string; warning: string }[] = [];

  public prevPosition: string;
  public position: string;
  public next: { success?: string; failed?: string } = {};

  public processResult = processResult;
  public processSuccess = processSuccess;
  public processFailure = processFailure;

  public stopReason: "complete" | "error" = "error";
  public status = 200;
  public res: undefined | Record<string, unknown> = undefined;

  constructor(map: FlowMap) {
    this.map = map;
    this.position = "start";
    this.prevPosition = "start";
    this.startAt = performance.now();
  }

  // start running the flow.
  async start() {
    await this.controller(this.position);

    return {
      status: this.status,
      reason: this.stopReason,
      result: this.res,
      errors: this.errors,
      took: performance.now() - this.startAt,
    };
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
        stop: true,
      });
      return;
    }

    if (block.type === "pointer") {
      await this.process.pointer(block);
      return;
    }

    if (block.type === "condition") {
      return;
    }

    await this.process.block(block);
  }

  process = {
    pointer: async ({ target }: Pointer) => {
      await this.controller(target);
    },

    block: async (block: Block) => {
      const { source, inputs, next } = block;
      const action = this.getSource(source);

      if (!action || typeof action !== "function") {
        return this.throwError({ err: "source not valid", stop: true });
      }

      this.next = next;
      const inputsProcessed = await dynamicInputs(this, inputs);
      await action(inputsProcessed, this);
    },
  };

  // deno-lint-ignore ban-types
  getSource(source: string): null | Function {
    if (!source) {
      return this.throwError({ err: "Block source is invalid", stop: true });
    }

    const [category, method] = source.split("/");
    const action = sources[category][method];

    return action;
  }

  throwError(
    { err, position, stop }: { err: string; position?: string; stop?: boolean },
  ) {
    this.errors.push({
      err,
      position: position || this.position,
    });

    if (stop) {
      this.status = 500;
      this.stop(true);
    }

    return null;
  }

  throwWarning({ warning, position }: { warning: string; position?: string }) {
    this.warnings.push({
      warning,
      position: position || this.position,
    });
  }
}

Deno.bench("Koxy", async () => {
  const koxy = new Koxy(map);
  const res = await koxy.start();
});

// const koxy = new Koxy(map);
// const res = await koxy.start();
// console.log(res);

export { map, type Result };
export default Koxy;
