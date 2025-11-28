import { authConfig } from "@/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import * as client from "./client";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authConfig);

  console.log({ validSession: !!!session?.accessToken });

  if (!!!session?.accessToken) {
    return new NextResponse("Access Forbidden", { status: 403 });
  }

  const bungieRequest = request.nextUrl.pathname.replace("api/bungie/", "");

  console.log({ bungieRequest });

  const response = await client.get(bungieRequest);

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
