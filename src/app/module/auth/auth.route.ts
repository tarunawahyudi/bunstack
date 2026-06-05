import {Elysia} from "elysia"
import {container} from "tsyringe"
import {AuthControllerImpl} from "@module/auth/controller/auth.controller.impl"
import {loginRequestDto, refreshTokenRequestDto} from "@module/auth/dto/auth.request.dto"
import {requireAuth} from "@core/middleware/auth.middleware"

export function registerAuthRoutes(app: Elysia) {
  const authController = container.resolve(AuthControllerImpl)

  return app.group("/auth", (group) =>
    group
      .post("/login", authController.login.bind(authController), {
        body: loginRequestDto,
        detail: {
          tags: ["Auth"],
          summary: "Login with email and password",
        },
      })
      .post("/refresh", authController.refresh.bind(authController), {
        body: refreshTokenRequestDto,
        detail: {
          tags: ["Auth"],
          summary: "Refresh access token",
        },
      })
      .get("/me", authController.me.bind(authController), {
        beforeHandle: requireAuth,
        detail: {
          tags: ["Auth"],
          summary: "Get authenticated user",
          security: [{ bearerAuth: [] }],
        },
      }),
  )
}
