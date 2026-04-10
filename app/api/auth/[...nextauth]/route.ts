import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!
    })
  ],
  callbacks: {
    async jwt({ token }) {
      // Only fetch API token once (first sign in)
      if (!token.apiToken) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            username: process.env.API_USERNAME!,
            password: process.env.API_PASSWORD!
          }),
        })
        const data = await res.json()
        token.apiToken = data.token
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