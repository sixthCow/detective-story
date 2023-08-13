import NextAuth, { NextAuthOptions } from "next-auth"

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    {
      id: "worldcoin",
      name: "Worldcoin",
      type: "oauth",
      wellKnown: "https://id.worldcoin.org/.well-known/openid-configuration",
      authorization: { params: { scope: "openid" } },
      clientId: "app_staging_ff401a21a4110e56a6bb96665246a030",
      clientSecret: "sk_c5e040ff4a08b7ffb974c5284f14e2564e475e1247164a1e",
      idToken: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.sub,
          credentialType: profile["https://id.worldcoin.org/beta"].credential_type,
        }
      },
    },
  ],
  callbacks: {
    async jwt({ token }) {
      token.userRole = "admin"
      return token
    },
  },
}

export default NextAuth(authOptions)