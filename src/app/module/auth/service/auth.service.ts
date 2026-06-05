import {User} from "@module/user/entity/user"

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthLoginResult extends AuthTokens {
  user: User
}

export interface AuthService {
  login(email: string, password: string): Promise<AuthLoginResult>
  refresh(refreshToken: string): Promise<AuthLoginResult>
  getAuthenticatedUser(accessToken: string): Promise<User>
}
