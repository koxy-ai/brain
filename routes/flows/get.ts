import { Context } from "hono";
import koxyResponse from "../../helpers/koxy-response.ts";
import getFlow from "../../controllers/flows/get.ts";

export default async function getFlowRoute(c: Context) {
  const workspaceId = c.req.header("workspaceId");
  const id = c.req.header("id");

  if (!id || !workspaceId) {
    return koxyResponse(c, {
      status: 403,
      success: false,
      body: {
        msg: "Invalid request",
      },
    });
  }

  const flow = await getFlow({ id, workspaceId });

  if (!flow) {
    return koxyResponse(c, {
      status: 404,
      success: false,
      body: {
        msg: "Flow not found or token is invalid",
      },
    });
  }

  return koxyResponse(c, {
    status: 200,
    success: true,
    body: {
      flow,
    },
  });
}
