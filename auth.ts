import type { NextAuthOptions } from "next-auth";
import BungieProvider from "next-auth/providers/bungie";

export const authConfig = {
  providers: [
    BungieProvider({
      clientId: process.env.BUNGIE_CLIENT_ID,
      clientSecret: process.env.BUNGIE_SECRET,
      authorization: { params: { scope: "" } },
      httpOptions: {
        headers: {
          "X-API-Key": process.env.BUNGIE_API_KEY,
        },
      },
      userinfo: {
        async request({ tokens, provider }) {
          const headers = new Headers(
            provider.httpOptions?.headers as HeadersInit | undefined
          );

          headers.append("authorization", `Bearer ${tokens.access_token}`);

          return await fetch(
            "https://www.bungie.net/platform/User/GetMembershipsForCurrentUser",
            { headers }
          ).then(async (response) => await response.json());
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ account, token, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }

      if (profile) {
        const { destinyMemberships } = profile.Response;

        const destinyMembership = (
          destinyMemberships.length > 1
            ? destinyMemberships.filter(
                (destinyMembership) =>
                  destinyMembership.applicableMembershipTypes.length > 0
              )
            : [destinyMemberships[0]]
        )[0];

        token.destinyMembershipId = destinyMembership.membershipId;
        token.destinyMembershipType = destinyMembership.membershipType;
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.destinyMembershipId = token.destinyMembershipId;
      session.destinyMembershipType = token.destinyMembershipType;

      return session;
    },
  },
} satisfies NextAuthOptions;
