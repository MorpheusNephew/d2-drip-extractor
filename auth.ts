import type { NextAuthOptions } from "next-auth";
import BungieProvider from "next-auth/providers/bungie";
import { BUNGIE_CLIENT_ID, BUNGIE_SECRET, BUNGIE_API_KEY } from "./variables";

export const authConfig = {
  providers: [
    BungieProvider({
      clientId: BUNGIE_CLIENT_ID,
      clientSecret: BUNGIE_SECRET,
      authorization: { params: { scope: "" } },
      httpOptions: {
        headers: {
          "X-API-Key": BUNGIE_API_KEY,
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
    async jwt({ account, token }) {
      if (account) {
        token.accessToken = account.access_token;
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;

      return session;
    },
  },
} satisfies NextAuthOptions;
