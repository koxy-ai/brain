import { 
    type Response, 
    type Request,
    type Cookies
} from "https://deno.land/x/oak@v13.0.0/mod.ts";

interface RouterParams {
    request: Request,
    response: Response
}

export default RouterParams;