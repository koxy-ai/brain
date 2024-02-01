import { Context } from "https://deno.land/x/hono@v3.12.9/mod.ts";

interface Options {
    status: number,
    success: boolean,
    body: Record<string, unknown>
}

export default function koxyResponse(c: Context, options: Options) {

    const { status, success, body } = options;

    c.header("content-type", "application/json");
    return c.json({
        status,
        success,
        ...body
    }, status);

}