/**
 * Extends NextAuth's built-in Session and JWT types to carry API tokens
 * issued by the upstream backend after GitHub OAuth exchange.
 */
import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    /** Short-lived JWT issued by the backend API. Null if refresh failed. */
    apiToken?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** Short-lived access token for the backend API. Null after a failed refresh. */
    apiToken?: string | null
    /** Refresh token used to obtain a new access token when the current one expires. */
    refreshToken?: string
    /** Unix timestamp (ms) at which `apiToken` expires. */
    expiresAt?: number
  }
}