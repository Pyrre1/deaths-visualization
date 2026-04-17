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
  callbacks: {
    async jwt({ token, account, profile }) {
      console.log("JWT callback - account:", account, "profile:", profile)
      if (account && profile) {
        console.log("Calling /auth/oauth...")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/oauth`, {
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
        console.log("Response status:", res.status)
        const data = await res.json()
        console.log("Response data:", data)
        token.apiToken = data.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.apiToken = token.apiToken as string
      console.log("Session callback - session:", session, "token:", token)
      return session
    },
  },
}