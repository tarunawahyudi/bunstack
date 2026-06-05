export interface HealthStatus {
  status: "ok"
  uptime: number
  timestamp: string
  database: {
    status: "ok"
  }
}

export interface HealthService {
  check(): Promise<HealthStatus>
}
