import { JWT } from "next-auth/jwt";
import { Session, Profile } from "next-auth";
import { BungieMembershipType } from "bungie-api-ts/app";
import { UserMembershipData } from "bungie-api-ts/user";

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    destinyMembershipId?: string;
    destinyMembershipType?: BungieMembershipType;
  }
}

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken?: string;
    destinyMembershipId?: string;
    destinyMembershipType?: BungieMembershipType;
  }

  interface Profile {
    Response: UserMembershipData;
  }
}
