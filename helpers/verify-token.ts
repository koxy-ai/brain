import jwt from "npm:jsonwebtoken";

export default function verifyToken(token: string) {

    const secret = Deno.env.get("SECRET_KEY");

    try {
        const verification = jwt.verify(token, secret);
        return verification;
    }

    catch(_err: unknown) {
        return null;
    }

}