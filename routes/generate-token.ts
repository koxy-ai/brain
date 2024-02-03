import jwt from "npm:jsonwebtoken";
import { Context } from "hono";
import koxyResponse from "../helpers/koxy-response.ts";

export default function generateToken(c: Context) {
  const workspaceId = c.req.header("workspaceId");

  if (!workspaceId) {
    return koxyResponse(c, {
      success: false,
      status: 403,
      body: {
        msg: "WorkspaceId header is not found",
      },
    });
  }

  const secret = Deno.env.get("SECRET_KEY");
  const token = jwt.sign({ id: workspaceId }, secret);

  return koxyResponse(c, {
    status: 200,
    success: true,
    body: {
      msg: "Generated token",
      token,
    },
  });
}
