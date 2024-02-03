import db from "../../db/init.ts";
import jwt from "npm:jsonwebtoken";

type Params = {
  newFlow: string;
  id: string;
  workspaceId: string;
};

export default async function updateFlow(params: Params) {
  const { newFlow, id, workspaceId } = params;

  if (!newFlow || !id || !workspaceId) {
    return false;
  }

  try {
    const secret = Deno.env.get("SECRET_KEY");
    const encrypted = jwt.sign(JSON.parse(newFlow), secret);

    await db.set([workspaceId, "flows", id], {
      flow: encrypted,
    });
  } catch (_err: unknown) {
    return false;
  }
}
