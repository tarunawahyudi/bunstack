import { Elysia } from "elysia"
import { setupContainer } from "@core/container"
import { registerUserRoutes } from "@module/user/user.route"
import { registerAuthRoutes } from "@module/auth/auth.route"
import { registerHealthRoutes } from "@module/health/health.route"
import { startup } from "@core/startup"
import { swaggerPlugin } from "@core/config/swagger.config"
import { loggerMiddleware } from '@core/middleware/logger.middleware'
import { errorMiddleware } from '@core/middleware/error.middleware'
import { corsMiddleware } from '@core/middleware/cors.middleware'

/**
 * Application entry point.
 *
 * Initializes the dependency container, registers middlewares,
 * sets up routes, and starts the HTTP server.
 */
async function main() {
  // Initialize dependency injection container
  await setupContainer()

  const app = new Elysia()
    /**
     * Global logger middleware
     * Handles logging for all incoming requests and system events
     */
    .use(loggerMiddleware)

    /**
     * CORS middleware
     * Enables Cross-Origin Resource Sharing based on configured policies
     */
    .use(corsMiddleware())

    /**
     * Swagger API documentation plugin
     * Automatically generates and serves OpenAPI documentation
     */
    .use(swaggerPlugin)

    /**
     * Global error handler
     * Catches exceptions and returns standardized error responses
     */
    .use(errorMiddleware)

    /**
     * Application routes
     * Registers all application route handlers
     */
    .use(registerHealthRoutes)
    .use(registerAuthRoutes)
    .use(registerUserRoutes)

  // Run startup tasks
  startup()

  // Start HTTP server
  app.listen(process.env.APP_PORT ?? 8080)
}

main()
