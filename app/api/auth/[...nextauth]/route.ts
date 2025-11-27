import NextAuth from "next-auth";
import BungieProvider from "next-auth/providers/bungie";

const handler = NextAuth({
  debug: true,
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
        url: "https://www.bungie.net/platform/User/GetMembershipsForCurrentUser",
        async request(context) {
          console.log({
            access_token: !!context.tokens.access_token,
            id_token: !!context.tokens.id_token,
            scope: context.tokens.scope,
            provider: JSON.stringify(context.provider),
          });

          return {};
        },
      },
    }),
  ],
});

export { handler as GET, handler as POST };
