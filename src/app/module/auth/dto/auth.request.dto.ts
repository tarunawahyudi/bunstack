import {t} from "elysia"

export const loginRequestDto = t.Object({
  email: t.String({required: true, format: "email"}),
  password: t.String({minLength: 6}),
})

export const refreshTokenRequestDto = t.Object({
  refreshToken: t.String({minLength: 1}),
})
