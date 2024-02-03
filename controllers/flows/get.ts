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

  const data = await db.get([workspaceId, "flows", id]);
  const value = data.value as any;

  if (!value) {
    return null;
  }

  try {
    return verifyToken(value?.flow);
  } catch (_err: unknown) {
    return null;
  }
}
