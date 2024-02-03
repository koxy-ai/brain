import db from "./init.ts";
import { Context } from "https://deno.land/x/hono@v3.12.9/mod.ts";

type Schema = Record<
  string,
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "array"
  | "null"
  | "any"
  | "unknown"
>;

interface Params {
  secret: string;
  name: string;
  workspaceId: string;
}

export default async function createCollection(params: Params) {
  const { name, workspaceId } = params;
  type = type || "data";

  if (!name) {
    return { success: false, msg: "Collection name is required" };
  }

  if (!workspaceId) {
    return { success: false, msg: "Workspace ID is required" };
  }

  try {
    await db.set([workspaceId, "collections", name], {
      schema: schema | "any",
      vector: vector | false,
    });
  } catch (error) {
    return { success: false, msg: error };
  }
}

export { type Params };
export default createCollection;
