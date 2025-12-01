import type { NextAuthOptions } from "next-auth";
import BungieProvider from "next-auth/providers/bungie";
import {
  BUNGIE_API_KEY,
  BUNGIE_CLIENT_ID,
  BUNGIE_PLATFORM,
  BUNGIE_SECRET,
} from "./lib/bungie";

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
    async jwt({ account, token, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpiresAt = account.expires_at * 1000;

        const refreshTokenExpiration = new Date();
        refreshTokenExpiration.setSeconds(
          refreshTokenExpiration.getSeconds() + account.refresh_expires_in
        );
        token.refreshTokenExpiresAt = refreshTokenExpiration.getTime();
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

      // If access token is expired, refresh it
      if (
        token.accessTokenExpiresAt &&
        token.accessTokenExpiresAt < Date.now() &&
        token.refreshToken &&
        token.refreshTokenExpiresAt &&
        token.refreshTokenExpiresAt > Date.now()
      ) {
        const response = await fetch(`${BUNGIE_PLATFORM}/app/oauth/token/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-API-Key": BUNGIE_API_KEY,
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: token.refreshToken!,
            client_id: BUNGIE_CLIENT_ID,
            client_secret: BUNGIE_SECRET,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to refresh access token");
        }

        const updateTokenInfo = await response.json();

        const accessTokenExpiration = new Date();
        accessTokenExpiration.setSeconds(
          accessTokenExpiration.getSeconds() + updateTokenInfo.expires_in
        );

        token.accessToken = updateTokenInfo.access_token;
        token.accessTokenExpiresAt = accessTokenExpiration.getTime();

        const refreshTokenExpiration = new Date();
        refreshTokenExpiration.setSeconds(
          refreshTokenExpiration.getSeconds() +
            updateTokenInfo.refresh_expires_in
        );

        token.refreshToken = updateTokenInfo.refresh_token;
        token.refreshTokenExpiresAt = refreshTokenExpiration.getTime();
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token?.accessToken;
      session.destinyMembershipId = token?.destinyMembershipId;
      session.destinyMembershipType = token?.destinyMembershipType;

      return session;
    },
  },
} satisfies NextAuthOptions;
