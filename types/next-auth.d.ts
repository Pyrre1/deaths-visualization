import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    apiToken?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    apiToken?: string | null
    refreshToken?: string
    expiresAt?: number
  }
}