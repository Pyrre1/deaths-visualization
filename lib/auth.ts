import GithubProvider from "next-auth/providers/github"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      checks: ["pkce"],
    }),
  ],
  pages: {
    signIn: "/api/auth/signin",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url
      return `${baseUrl}/dashboard`
    },
    async jwt({ token, account, profile }) {
      // Initial login — exchange GitHub OAuth for API tokens
      if (account && profile) {
        const res = await fetch(`${process.env.API_BASE_URL}/api/v1/auth/oauth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Internal-Secret": process.env.INTERNAL_SECRET!,
          },
          body: JSON.stringify({
            github_id: String((profile as { id?: number }).id ?? account.providerAccountId),
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

      // Token expired — refresh
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
        //Refresh token expired or invalid, force re-login
        token.apiToken = null
      }
      return token
    },
    async session({ session, token }) {
      session.apiToken = token.apiToken as string
      return session
    },
  },
}