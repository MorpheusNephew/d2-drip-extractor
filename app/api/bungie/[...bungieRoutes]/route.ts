import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  console.log(request.nextUrl.pathname);

  const res = await fetch("/api/auth/session", {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const myJson = await res.json();

  console.log({ myJson });

  return Response.json({ status: 200, message: "Hello" });
}
