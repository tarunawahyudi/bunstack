import config from "@core/config"
import {AppException} from "@core/exception/app.exception"

export type TokenType = "access" | "refresh"

export interface JwtPayload {
  sub: number
  email: string
  type: TokenType
  iat: number
  exp: number
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function base64UrlEncode(input: string | Uint8Array): string {
  const bytes = typeof input === "string" ? encoder.encode(input) : input
  let binary = ""

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "")
}

function base64UrlDecode(input: string): ArrayBuffer {
  const paddedInput = input.padEnd(input.length + (4 - input.length % 4) % 4, "=")
  const base64 = paddedInput.replaceAll("-", "+").replaceAll("_", "/")
  const binary = atob(base64)
  const buffer = new ArrayBuffer(binary.length)
  const bytes = new Uint8Array(buffer)

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return buffer
}

function parseDurationInSeconds(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/)

  if (!match) {
    throw new Error(`Invalid token duration: ${duration}`)
  }

  const value = Number(match[1])
  const unit = match[2]

  switch (unit) {
    case "s":
      return value
    case "m":
      return value * 60
    case "h":
      return value * 60 * 60
    case "d":
      return value * 60 * 60 * 24
    default:
      throw new Error(`Unsupported token duration unit: ${unit}`)
  }
}

async function getJwtKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(config.auth.jwtSecret),
    {name: "HMAC", hash: "SHA-256"},
    false,
    ["sign", "verify"],
  )
}

export function getTokenExpiresInSeconds(type: TokenType): number {
  return parseDurationInSeconds(
    type === "access"
      ? config.auth.tokenExpiration
      : config.auth.refreshTokenExpiration,
  )
}

export async function signJwt(payload: Omit<JwtPayload, "iat" | "exp">): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const expiresIn = getTokenExpiresInSeconds(payload.type)
  const header = {
    alg: "HS256",
    typ: "JWT",
  }
  const jwtPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
  }
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(jwtPayload))
  const data = `${encodedHeader}.${encodedPayload}`
  const signature = await crypto.subtle.sign("HMAC", await getJwtKey(), encoder.encode(data))

  return `${data}.${base64UrlEncode(new Uint8Array(signature))}`
}

export async function verifyJwt(token: string, expectedType?: TokenType): Promise<JwtPayload> {
  const parts = token.split(".")

  if (parts.length !== 3) {
    throw new AppException("AUTH-003")
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts
  const data = `${encodedHeader}.${encodedPayload}`
  const isValid = await crypto.subtle.verify(
    "HMAC",
    await getJwtKey(),
    base64UrlDecode(encodedSignature),
    encoder.encode(data),
  )

  if (!isValid) {
    throw new AppException("AUTH-003")
  }

  const payload = JSON.parse(decoder.decode(base64UrlDecode(encodedPayload))) as JwtPayload
  const now = Math.floor(Date.now() / 1000)

  if (payload.exp <= now) {
    throw new AppException("AUTH-002")
  }

  if (expectedType && payload.type !== expectedType) {
    throw new AppException("AUTH-003")
  }

  return payload
}

export function getBearerToken(authorization?: string | null): string {
  if (!authorization) {
    throw new AppException("AUTH-004")
  }

  const [scheme, token] = authorization.split(" ")

  if (scheme !== "Bearer" || !token) {
    throw new AppException("AUTH-003")
  }

  return token
}
