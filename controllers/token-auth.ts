import koxyResponse from "../helpers/koxy-response.ts";
import { checkRevokedToken } from "./revoked-tokens.ts";
import verifyToken from "../helpers/verify-token.ts";
import { Context } from "https://deno.land/x/hono@v3.12.9/mod.ts";
import bearerToken from "../helpers/bearerToken.ts";

const validTokens = new Set<string>();

export default async function tokenAuth(c: Context, next: () => Promise<unknown>) {

    const authorization = c.req.header("Authorization") || c.req.header("authorization");

    // Return if headers are not in place
    if (!authorization) {
        return koxyResponse(c, {
            status: 401,
            success: false,
            body: {
                msg: "No authorization token provided."
            }
        })
    }

    const token = bearerToken(authorization);
    const verification = (validTokens.has(token)) ? true : verifyToken(token);

    // Return if token is invalid
    if (!verification) {
        return koxyResponse(c, {
            status: 401,
            success: false,
            body: {
                msg: "Token is invalid."
            }
        })
    }

    // add token to valid tokens
    validTokens.add(token);
    const isRevoked = await checkRevokedToken(verification.id, token);

    // Return if the token has been revoked
    if (isRevoked) {
        validTokens.delete(token);
        return koxyResponse(c, {
            status: 401,
            success: false,
            body: {
                msg: "Token has been revoked."
            }
        })
    }

    await next();

}