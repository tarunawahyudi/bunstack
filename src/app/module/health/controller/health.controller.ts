import {Context} from "elysia"

export interface HealthController {
  check(ctx: Context): Promise<any>
}
