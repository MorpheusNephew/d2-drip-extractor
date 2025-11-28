import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  console.log(request.nextUrl.pathname);

  console.log({ url: `https://${request.nextUrl.hostname}/api/auth/session` });

  return Response.json({ status: 200, message: "Hello" });
}
