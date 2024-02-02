import { Context } from "https://deno.land/x/hono@v3.12.9/mod.ts";
import koxyResponse from "../helpers/koxy-response.ts";

export default function _404(c: Context) {
  return koxyResponse(c, {
    status: 404,
    success: false,
    body: {
      msg: "Not found!",
    },
  });
}
