import { authConfig } from "@/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authConfig);

  console.log({ session });

  if (!!!session?.accessToken) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return NextResponse.json("Get your drip");
}
