import {Elysia} from "elysia"
import {container} from "tsyringe"
import {HealthControllerImpl} from "@module/health/controller/health.controller.impl"

export function registerHealthRoutes(app: Elysia) {
  const healthController = container.resolve(HealthControllerImpl)

  return app.get("/health", healthController.check.bind(healthController), {
    detail: {
      tags: ["Health"],
      summary: "Check application health",
    },
  })
}
