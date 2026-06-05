import {injectable} from "tsyringe"
import type {HealthService, HealthStatus} from "@module/health/service/health.service"
import {AppDataSource} from "@lib/datasource"

@injectable()
export class HealthServiceImpl implements HealthService {
  async check(): Promise<HealthStatus> {
    await AppDataSource.query("SELECT 1")

    return {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: {
        status: "ok",
      },
    }
  }
}
