import koxyResponse from "../../helpers/koxy-response.ts";
import updateFlow from "../../controllers/flows/update.ts";
import { Context } from "https://deno.land/x/hono@v3.12.9/mod.ts";

export default async function updateFlowRoute(c: Context) {
  const workspaceId = c.req.header("workspaceId");
  const id = c.req.header("id");
  const body = await c.req.parseBody();

  if (!id || !body || !workspaceId) {
    return koxyResponse(c, {
      status: 403,
      success: false,
      body: {
        msg: "Invalid request",
      },
    });
  }

  const { flow } = body;

  const update = await updateFlow({
    id,
    workspaceId,
    newFlow: flow as string,
  });

  if (!update) {
    return koxyResponse(c, {
      status: 500,
      success: false,
      body: {
        msg: "Could not update flow",
      },
    });
  }

  return koxyResponse(c, {
    status: 200,
    success: true,
    body: {
      msg: "Updated flow",
    },
  });
}
