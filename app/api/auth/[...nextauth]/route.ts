import NextAuth from "next-auth";
import BungieProvider from "next-auth/providers/bungie";

const handler = NextAuth({
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
});

export { handler as GET, handler as POST };
