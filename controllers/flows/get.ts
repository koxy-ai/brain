import db from "../../db/init.ts";
import verifyToken from "../../helpers/verify-token.ts";

interface Options {
  id: string;
  workspaceId: string;
}

export default async function getFlow(options: Options) {
  const { id, workspaceId } = options;

  if (!id || !workspaceId) {
    return null;
  }

  const value = await db.get([workspaceId, "flows", id]);

  if (!value || typeof value !== "string") {
    return null;
  }

  return verifyToken(value);
}
