import { type Request } from "https://deno.land/x/oak@v12.6.1/mod.ts";

export default function (request: Request) {

    const url = new URL(request.url.href);
    const params = url.searchParams;

    return params;

}