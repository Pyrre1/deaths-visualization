import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      checks: ["pkce"],
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Only fetch API token once (first sign in)
      if (!token.apiToken) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const https = require("https")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/oauth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            github_id: String((profile as { id?: number }).id ?? account?.providerAccountId),
            email: token.email,
            name: token.name,
          }),
          // @ts-expect-error - bypass self-signed cert on school server
          agent: new https.Agent({ rejectUnauthorized: false }),
        })
        const data = await res.json()
        token.apiToken = data.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.apiToken = token.apiToken as string
      return session
    },
  },
})

export { handler as GET, handler as POST }