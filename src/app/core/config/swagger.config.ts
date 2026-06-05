import swagger from "@elysiajs/swagger"
import config from "@core/config/index"

export const swaggerPlugin = swagger({
  path: config.swagger.path,
  provider: (config.swagger.provider ?? "swagger-ui") as "swagger-ui" | "scalar",
  autoDarkMode: config.swagger.darkMode,
  documentation: {
    openapi: config.swagger.version,
    info: {
      title: config.swagger.title,
      version: config.app.version,
      description: config.swagger.description,
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token. Example: Bearer <token>",
        },
      },
    },
  },
})
