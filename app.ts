import _404 from "./controllers/_404.ts";
import { Context, Hono } from "https://deno.land/x/hono@v3.12.9/mod.ts";
import revokeToken from "./routes/revoke-token.ts";
import tokenAuth from "./controllers/token-auth.ts";
import secret from "./controllers/secret.ts";
import generateToken from "./routes/generate-token.ts";
import koxyResponse from "./helpers/koxy-response.ts";
import Koxy, { map } from "./processor/main.ts";

import updateFlowRoute from "./routes/flows/update.ts";
import getFlowRoute from "./routes/flows/get.ts";

const app = new Hono();

app.get("/", (c: Context) => {
  return c.json({
    success: true,
    msg: "Hi",
  }, 200);
});

app.post("/revoke-token", secret, revokeToken);
app.post("/generate-token", secret, generateToken);

app.get("/flow", secret, getFlowRoute);
app.post("/flow", secret, updateFlowRoute);

app.post("/", async (c: Context) => {
  const koxy = new Koxy(map);
  const data = await koxy.start();

  return koxyResponse(c, {
    status: data.status,
    success: (data.reason === "complete") ? true : false,
    body: {
      result: data.result,
      errors: data.errors,
    },
  });
});

app.notFound(_404);

Deno.serve(app.fetch);
