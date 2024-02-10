import * as uuid from "https://deno.land/std@0.207.0/uuid/mod.ts";
import crypto from "node:crypto";
import type Types from "../../types/types.ts";
import Koxy from "../main.ts";

const operations: Record<string, { action: any; types: Types[] }> = {
  "Math": {
    action: Math,
    types: ["number", "array"],
  },
  "JSON": {
    action: JSON,
    types: ["object", "string", "number", "boolean"],
  },
  "Date": {
    action: Date,
    types: ["number"],
  },
  "RegExp": {
    action: RegExp,
    types: ["string"],
  },
  "Array": {
    action: Array,
    types: ["object", "array"],
  },
  "String": {
    action: String,
    types: ["string"],
  },
  "Number": {
    action: Number,
    types: ["number"],
  },
  "Boolean": {
    action: Boolean,
    types: ["boolean"],
  },
  "Object": {
    action: Object,
    types: ["object"],
  },
  "Base64": {
    action: () => ({
      encode: (value: unknown) => (btoa(value as string)),
      decode: (value: unknown) => (atob(value as string)),
    }),
    types: ["string"],
  },
  "typeof": {
    action: (value: unknown) => (typeof value),
    types: ["string", "number", "boolean", "object", "array"],
  },
  "isFinite": {
    action: (value: unknown) => (isFinite(Number(value))),
    types: ["number"],
  },
  "isNaN": {
    action: (value: unknown) => (isNaN(Number(value))),
    types: ["number", "string"],
  },
  "encodeURI": {
    action: (value: unknown) => (encodeURI(value as string)),
    types: ["string"],
  },
  "encodeURIComponent": {
    action: (
      value: unknown,
    ) => (encodeURIComponent(value as string | number | boolean)),
    types: ["string", "number", "boolean"],
  },
  "decodeURI": {
    action: (value: unknown) => (decodeURI(value as string)),
    types: ["string"],
  },
  "decodeURIComponent": {
    action: (value: unknown) => (decodeURIComponent(value as string)),
    types: ["string"],
  },
  "escape": {
    action: (value: unknown) => (escape(value as string)),
    types: ["string"],
  },
  "unescape": {
    action: (value: unknown) => (unescape(value as string)),
    types: ["string"],
  },
  "uuid": {
    action: uuid,
    types: ["string"],
  },
  "hash": {
    action: (
      value: unknown,
    ) => (crypto.createHash("sha256").update(value as string).digest("hex")),
    types: ["string"],
  },
};

export default function operation(op: string, value: unknown[]) {
  if (!op) {
    throw new Error("Missing operation");
  }
  const ops = op.split(".");
  let operation = operations[ops[0]]?.action;
  let types = operations[ops[0]]?.types;
  if (!operation || !types) {
    return value;
  }
  if (ops.length > 1) {
    for (const op of ops.slice(1)) {
      operation = operation[op];
      if (!operation) {
        return value;
      }
    }
  }
  value = operation(...value);
  return value;
}

// async function memoizeAsync<T extends (...args: any[]) => Promise<any>>(fn: T): Promise<(...args: Parameters<T>) => Promise<ReturnType<T>>> {
//   const cache: Record<string, Promise<ReturnType<T>>> = {};

//   return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
//     const key = JSON.stringify(args);
//     const cachedPromise = cache[key];
//     if (cachedPromise) {
//       return await cachedPromise;
//     }

//     const promise = fn(...args);
//     cache[key] = promise;
//     const result = await promise;
//     return result;
//   };
// }
