import { JWT } from "next-auth/jwt";
import { Session, Profile, Account } from "next-auth";
import { BungieMembershipType } from "bungie-api-ts/app";
import { UserMembershipData } from "bungie-api-ts/user";

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    // Time since epoch in milliseconds
    accessTokenExpiresAt?: number;
    refreshToken?: string;
    // Time since epoch in milliseconds
    refreshTokenExpiresAt?: number;
    destinyMembershipId?: string;
    destinyMembershipType?: BungieMembershipType;
  }
}

declare module "next-auth" {
  interface Account {
    // Time since epoch in seconds
    expires_at: number;
    // Seconds from now until the refresh token expires
    refresh_expires_in: number;
  }

  interface Session {
    accessToken?: string;
    destinyMembershipId?: string;
    destinyMembershipType?: BungieMembershipType;
  }

  interface Profile {
    Response: UserMembershipData;
  }
}
