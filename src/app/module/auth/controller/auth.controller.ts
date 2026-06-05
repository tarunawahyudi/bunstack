import {Context} from "elysia"

export interface AuthController {
  login(ctx: Context): Promise<any>
  refresh(ctx: Context): Promise<any>
  me(ctx: Context): Promise<any>
}
