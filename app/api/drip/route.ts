// app/api/drip/route.ts
import { NextResponse } from "next/server";

import { authConfig } from "@/auth"; // adjust if your auth helper is elsewhere
import { loadOwnedCosmetics } from "@/lib/destiny/cosmetics";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic"; // avoid caching per-user

export async function GET() {
  const session = await getServerSession(authConfig);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = session.accessToken;
  const destinyMembershipId = session.destinyMembershipId;
  const destinyMembershipType = session.destinyMembershipType;

  if (!accessToken || !destinyMembershipId || destinyMembershipType == null) {
    return NextResponse.json(
      { error: "Missing Bungie authentication data on session" },
      { status: 400 }
    );
  }

  try {
    // 3) Load cosmetics from Bungie (shaders + ornaments)
    const cosmetics = await loadOwnedCosmetics({
      accessToken,
      membershipType: destinyMembershipType,
      destinyMembershipId,
    });

    // 4) Return as JSON
    return NextResponse.json(cosmetics, { status: 200 });
  } catch (err) {
    console.error("[drip endpoint] Failed to load cosmetics", err);
    return NextResponse.json(
      { error: "Failed to load cosmetics from Bungie" },
      { status: 500 }
    );
  }
}
