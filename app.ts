import _404 from "./controllers/_404.ts";
import { Context, Hono } from "https://deno.land/x/hono@v3.12.9/mod.ts";
import revokeToken from "./routes/revoke-token.ts";
import tokenAuth from "./controllers/token-auth.ts";
import koxyResponse from "./helpers/koxy-response.ts";
import Koxy, { Result, map } from "./processor/main.ts";

const app = new Hono();

app.post("/revoke-token", revokeToken);
app.get("/", (c: Context) => {

    return c.json({
        success: true,
        msg: "Hi"
    }, 200)

})

app.post("/", async (c: Context) => {

    const koxy = new Koxy(map);
    const data = await koxy.start();

    return koxyResponse(c, {
        status: data.status,
        success: (data.reason === "complete") ? true : false,
        body: {
            result: data.result,
            errors: data.errors
        }
    })    

})

app.notFound(_404);

Deno.serve(app.fetch);