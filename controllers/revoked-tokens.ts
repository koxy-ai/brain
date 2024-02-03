import db from "../db/init.ts";

export async function checkRevokedToken(id: string, token: string) {
  const revokedTokens = await getRevokedTokens(id);
  return (revokedTokens.indexOf(token) === -1) ? false : true;
}

export async function getRevokedTokens(id: string) {
  const savedTokens = (await db.get(["revoked-tokens", id])).value as {
    tokens: string[];
  };
  const tokens = savedTokens || { tokens: [] };

  return tokens.tokens;
}

export async function updateRevokedTokens(id: string, tokens: string[]) {
  const payload = { tokens };
  await db.set(["revoked-tokens", id], payload);
}
