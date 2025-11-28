import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  console.log(request.nextUrl.pathname);

  const sessionUrl = `https://${request.nextUrl.hostname}/api/auth/session`;

  const res = await fetch(sessionUrl, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  console.log({ data: JSON.stringify(data) });

  return Response.json({ status: 200, message: "Hello" });
}
