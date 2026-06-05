import {Context} from "elysia"
import {inject, injectable} from "tsyringe"
import type {HealthController} from "@module/health/controller/health.controller"
import type {HealthService} from "@module/health/service/health.service"
import {successResponse} from "@shared/util/response.util"

@injectable()
export class HealthControllerImpl implements HealthController {
  constructor(@inject("HealthService") private readonly healthService: HealthService) {}

  async check(ctx: Context) {
    const health = await this.healthService.check()
    return successResponse(ctx, health, "Health check passed", 200)
  }
}
