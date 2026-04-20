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
      if (account && profile) {
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
        const data = await res.json()
        token.apiToken = data.access_token
        token.refreshToken = data.refresh_token
      }
      return token
    },
    async session({ session, token }) {
      session.apiToken = token.apiToken as string
      return session
    },
  },
}