import { Router } from "https://deno.land/x/oak@v13.0.0/mod.ts";
import koxyResponse from "./helpers/koxy-response.ts";
import { revokeToken } from "./routes/revoke-token.ts";
import tokenAuth from "./controllers/token-auth.ts";
import updateFlow from "./routes/flows/update.ts";

const router = new Router();

router.post("/revoke-token", revokeToken);
router.post("/flow", tokenAuth, updateFlow);

router.get("/", ({ response }) => {

    return koxyResponse(response, {
        status: 200,
        success: true,
        body: {
            msg: "This is Koxy AI brain.!"
        }
    })

})

router.post("/", tokenAuth, ({ response }) => {

    return koxyResponse(response, {
        status: 200,
        success: true,
        body: {
            msg: "Welcome"
        }
    })

})

export default router;