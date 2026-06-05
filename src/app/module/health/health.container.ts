import {container} from "tsyringe"
import type {HealthService} from "@module/health/service/health.service"
import {HealthServiceImpl} from "@module/health/service/health.service.impl"
import {HealthControllerImpl} from "@module/health/controller/health.controller.impl"

export async function registerHealthModule() {
  container.register<HealthService>("HealthService", {useClass: HealthServiceImpl})
  container.register("HealthController", {useClass: HealthControllerImpl})
}
