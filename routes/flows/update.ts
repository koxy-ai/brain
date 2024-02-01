import koxyResponse from "../../helpers/koxy-response.ts";
import verifyToken from "../../helpers/verify-token.ts";
import updateFlow from "../../controllers/flows/update.ts";
import { Context } from "https://deno.land/x/hono@v3.12.9/mod.ts";
import bearerToken from "../../helpers/bearerToken.ts";

export default async function UpdateFlowRoute(c: Context) {

    const id = c.req.header("id");
    const bearer = c.req.header("Authorization") || c.req.header("authorization");
    const body = await c.req.parseBody();

    if (!id || !bearer || !body) {
        return koxyResponse(c, {
            status: 403,
            success: false,
            body: {
                msg: "Invalid headers or body"
            }
        })
    }

    const token = bearerToken(bearer);
    const workspaceId = verifyToken(token)?.id;

    if (!workspaceId) {
        return koxyResponse(c, {
            status: 400,
            success: false,
            body: {
                msg: "Invalid token payload"
            }
        })
    }

    const { flow } = body;

    const update = await updateFlow({
        id,
        workspaceId,
        newFlow: flow as string
    })

    if (!update) {
        return koxyResponse(c, {
            status: 400,
            success: false,
            body: {
                msg: "Could not update flow"
            }
        })
    }

    return koxyResponse(c, {
        status: 200,
        success: true,
        body: {
            msg: "Updated flow"
        }
    })

}