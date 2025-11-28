import { authConfig } from "@/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import * as client from "./client";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authConfig);

  if (!!!session?.accessToken) {
    return new NextResponse("Access Forbidden", { status: 403 });
  }

  const bungieRequest = request.nextUrl.pathname.replace("api/bungie/", "");

  const response = await client.get(
    bungieRequest,
    session.accessToken,
    Object.fromEntries(request.nextUrl.searchParams)
  );

  const data = await response.json();

  return response.ok
    ? NextResponse.json(data.Response, { status: response.status })
    : NextResponse.json(data, { status: response.status });
}
