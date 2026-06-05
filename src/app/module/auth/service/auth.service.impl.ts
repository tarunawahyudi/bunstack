import {inject, injectable} from "tsyringe"
import type {UserRepository} from "@module/user/repository/user.repository"
import type {AuthLoginResult, AuthService, AuthTokens} from "@module/auth/service/auth.service"
import {AppException} from "@core/exception/app.exception"
import {getTokenExpiresInSeconds, signJwt, verifyJwt} from "@shared/util/jwt.util"
import {User} from "@module/user/entity/user"

@injectable()
export class AuthServiceImpl implements AuthService {
  constructor(@inject("UserRepository") private readonly userRepository: UserRepository) {}

  async login(email: string, password: string): Promise<AuthLoginResult> {
    const user = await this.userRepository.findByEmail(email)

    if (!user || !await Bun.password.verify(password, user.password)) {
      throw new AppException("AUTH-001")
    }

    const tokens = await this.createTokens(user)
    return {
      ...tokens,
      user,
    }
  }

  async refresh(refreshToken: string): Promise<AuthLoginResult> {
    const payload = await verifyJwt(refreshToken, "refresh")
    const user = await this.userRepository.findById(payload.sub)

    if (!user) {
      throw new AppException("AUTH-003")
    }

    const tokens = await this.createTokens(user)
    return {
      ...tokens,
      user,
    }
  }

  async getAuthenticatedUser(accessToken: string): Promise<User> {
    const payload = await verifyJwt(accessToken, "access")
    const user = await this.userRepository.findById(payload.sub)

    if (!user) {
      throw new AppException("AUTH-003")
    }

    return user
  }

  private async createTokens(user: User): Promise<AuthTokens> {
    const accessToken = await signJwt({
      sub: user.id,
      email: user.email,
      type: "access",
    })
    const refreshToken = await signJwt({
      sub: user.id,
      email: user.email,
      type: "refresh",
    })

    return {
      accessToken,
      refreshToken,
      expiresIn: getTokenExpiresInSeconds("access"),
    }
  }
}
