import { authConfig } from "@/auth";
import { getServerSession } from "next-auth";

export async function GET() {
  const stuff = await getServerSession(authConfig);

  console.log({ user: stuff?.user, expires: stuff?.expires });

  return Response.json({ status: 200, message: "Hello" });
}
