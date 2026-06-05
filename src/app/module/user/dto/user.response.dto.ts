import {User} from "@module/user/entity/user"

export interface UserResponseDto {
  id: number
  email: string
}

export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
  }
}

export function toUserResponseDtos(users: User[]): UserResponseDto[] {
  return users.map(toUserResponseDto)
}
