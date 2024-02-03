import jwt from "npm:jsonwebtoken";
import { Context } from "hono";
import koxyResponse from "../helpers/koxy-response.ts";

export default async function secret(c: Context, next: () => Promise<unknown>) {
  const secret = c.req.header("secret") || "NONE";
  const koxySecret = Deno.env.get("KOXY_SECRET");

  try {
    const decodedSecret = jwt.verify(secret, koxySecret)?.token;
    if (decodedSecret !== koxySecret) {
      return koxyResponse(c, {
        status: 403,
        success: false,
        body: {
          msg: "Secret key is not authorized.",
        },
      });
    }
    await next();
  } catch (_err: unknown) {
    return koxyResponse(c, {
      status: 403,
      success: false,
      body: {
        msg: "Secret key is not authorized.",
      },
    });
  }

  await next();
}
