import {User} from "@module/user/entity/user"
import {UserResponseDto, toUserResponseDto} from "@module/user/dto/user.response.dto"

export interface AuthTokenResponseDto {
  tokenType: "Bearer"
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: UserResponseDto
}

export function toAuthTokenResponseDto(
  user: User,
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
): AuthTokenResponseDto {
  return {
    tokenType: "Bearer",
    accessToken,
    refreshToken,
    expiresIn,
    user: toUserResponseDto(user),
  }
}
