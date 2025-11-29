import { authConfig } from "@/auth";
import { bungieClient } from "@/lib/bungie";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authConfig);

  if (!!!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bungieRequest = request.nextUrl.pathname.replace("api/bungie/", "");

  try {
    const response = await bungieClient.get(
      bungieRequest,
      session.accessToken,
      Object.fromEntries(request.nextUrl.searchParams)
    );

    return NextResponse.json(response);
  } catch (err) {
    console.error(`Error requesting ${bungieRequest}`, err);

    return NextResponse.json(`Error requesting ${bungieRequest}`, {
      status: 500,
    });
  }
}
