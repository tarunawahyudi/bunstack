import {Context} from "elysia"
import {inject, injectable} from "tsyringe"
import type {AuthController} from "@module/auth/controller/auth.controller"
import type {AuthService} from "@module/auth/service/auth.service"
import {successResponse} from "@shared/util/response.util"
import {getBearerToken} from "@shared/util/jwt.util"
import {toAuthTokenResponseDto} from "@module/auth/dto/auth.response.dto"
import {toUserResponseDto} from "@module/user/dto/user.response.dto"

interface LoginRequestBody {
  email: string
  password: string
}

interface RefreshTokenRequestBody {
  refreshToken: string
}

@injectable()
export class AuthControllerImpl implements AuthController {
  constructor(@inject("AuthService") private readonly authService: AuthService) {}

  async login(ctx: Context) {
    const body = ctx.body as LoginRequestBody
    const result = await this.authService.login(body.email, body.password)

    return successResponse(
      ctx,
      toAuthTokenResponseDto(result.user, result.accessToken, result.refreshToken, result.expiresIn),
      "Login successful",
      200,
    )
  }

  async refresh(ctx: Context) {
    const body = ctx.body as RefreshTokenRequestBody
    const result = await this.authService.refresh(body.refreshToken)

    return successResponse(
      ctx,
      toAuthTokenResponseDto(result.user, result.accessToken, result.refreshToken, result.expiresIn),
      "Token refreshed successfully",
      200,
    )
  }

  async me(ctx: Context) {
    const token = getBearerToken(ctx.request.headers.get("authorization"))
    const user = await this.authService.getAuthenticatedUser(token)

    return successResponse(ctx, toUserResponseDto(user), "Authenticated user fetched successfully", 200)
  }
}
