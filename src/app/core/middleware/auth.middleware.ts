import type {Context} from "elysia"
import {getBearerToken, verifyJwt} from "@shared/util/jwt.util"

export async function requireAuth(ctx: Context) {
  const token = getBearerToken(ctx.request.headers.get("authorization"))
  await verifyJwt(token, "access")
}
