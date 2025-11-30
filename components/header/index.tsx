"use client";

import { useSession } from "next-auth/react";
import AuthButton from "./AuthButton";
import StatusIndicator from "./StatusIndicator";

export default function Header() {
  const { data: session, status } = useSession();

  const statusMessage =
    status === "authenticated" ? `${session.user?.name}` : "Not Connected";

  return (
    <header className="w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-br from-[#0a0e1a]/80 to-[#0d1429]/80 backdrop-blur-sm border border-[#4a9eff]/20 shadow-2xl shadow-[#4a9eff]/5">
        <StatusIndicator status={status} message={statusMessage} />
        <AuthButton status={status} />
      </div>
    </header>
  );
}
