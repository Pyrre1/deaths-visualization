import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"

import type { NextAuthOptions } from "next-auth"

/**
 * NextAuth configuration for the application.
 *
 * Authentication flow:
 * 1. User signs in with GitHub OAuth (PKCE).
 * 2. The `jwt` callback exchanges the GitHub profile for backend API tokens.
 * 3. On every subsequent request the `jwt` callback silently refreshes the
 *    access token when it has expired.
 * 4. The `session` callback exposes `apiToken` to the client session.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      checks: ["pkce"],
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: "/api/auth/signin",
  },
  callbacks: {
    /**
       * Redirects to /dashboard after sign-in for same-origin URLs,
       * blocking open-redirect attacks from external `callbackUrl` values.
       */
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url
      return `${baseUrl}/dashboard`
    },
    async jwt({ token, account, profile }) {
      /**
       * Runs on every JWT creation or update.
       * Three branches:
       *   1. Initial login (`account` present) — exchange OAuth provider identity (GitHub or Google) for API tokens.
       *   2. Token still valid — return unchanged.
       *   3. Token expired — attempt silent refresh; null `apiToken` on failure so the
       *      proxy returns 401 and the interceptor in `apiClient.ts` redirects to sign-in.
       */
      if (account && profile) {
        const provider = account.provider
        const providerId = account.providerAccountId

        const res = await fetch(`${process.env.API_BASE_URL}/api/v1/auth/oauth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Internal-Secret": process.env.INTERNAL_SECRET!,
          },
          body: JSON.stringify({
            provider,
            provider_id: providerId,
            // github_id: String((profile as { id?: number }).id ?? account.providerAccountId),
            email: token.email,
            name: token.name,
          }),
        })
        const data = await res.json()
        token.apiToken = data.access_token
        token.refreshToken = data.refresh_token
        token.expiresAt = Date.now() + data.expires_in * 1000
        return token
      }
      
      // Token still valid
      if (Date.now() < (token.expiresAt as number)) {
        return token
      }

      // Access token expired — attempt a silent refresh using the stored refresh token.
      try {
        const res = await fetch(`${process.env.API_BASE_URL}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: token.refreshToken }),
        })
        if (!res.ok) throw new Error("Refresh failed")
          const data = await res.json()
          token.apiToken = data.access_token
          token.refreshToken = data.refresh_token
          token.expiresAt = Date.now() + data.expires_in * 1000
      } catch {
        // Refresh token is expired or invalid. Nulling apiToken causes the proxy
        // to return 401, which the axios interceptor converts to a redirect to "/".
        token.apiToken = null
      }
      return token
    },
    /**
     * Copies `apiToken` from the JWT into the client-visible session.
     * Only `apiToken` is forwarded — refresh token and expiry stay server-side.
     */
    async session({ session, token }) {
      session.apiToken = token.apiToken as string
      return session
    },
  },
}