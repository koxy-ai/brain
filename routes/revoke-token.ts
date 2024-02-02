import koxyResponse from "../helpers/koxy-response.ts";
import {
  getRevokedTokens,
  updateRevokedTokens,
} from "../controllers/revoked-tokens.ts";
import verifyToken from "../helpers/verify-token.ts";
import { Context } from "https://deno.land/x/hono@v3.12.9/mod.ts";

export default async function revokeToken(c: Context) {
  const id = c.req.header("workspaceId");
  const token = c.req.header("token");

  if (!id || !token) {
    return koxyResponse(c, {
      status: 400,
      success: false,
      body: {
        msg: "Set the workspaceId and token headers.",
      },
    });
  }

  const check = await verifyToken(token);

  if (!check) {
    return koxyResponse(c, {
      status: 400,
      success: false,
      body: {
        msg: "The token you sent is not valid",
      },
    });
  }

  const tokens = await getRevokedTokens(id);
  tokens.push(token);

  await updateRevokedTokens(id, tokens);

  return koxyResponse(c, {
    status: 200,
    success: true,
    body: {
      msg: "Revoked token",
    },
  });
}
