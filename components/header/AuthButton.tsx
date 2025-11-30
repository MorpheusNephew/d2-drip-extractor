"use client";

import { signIn, signOut } from "next-auth/react";

interface AuthButtonProps {
  status: string;
}

export default function AuthButton({ status }: AuthButtonProps) {
  if (status === "authenticated") {
    return (
      <button
        onClick={() => signOut()}
        className="px-6 py-2.5 bg-gradient-to-r from-red-600/80 to-red-500/80 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] border border-red-400/30"
      >
        Sign Out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("bungie")}
      className="px-6 py-2.5 bg-gradient-to-r from-[#4a9eff] to-[#00d4ff] hover:from-[#00d4ff] hover:to-[#4a9eff] text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-[#4a9eff]/20 hover:shadow-[#4a9eff]/40 hover:scale-[1.02] active:scale-[0.98] border border-[#4a9eff]/30"
    >
      Connect with Bungie
    </button>
  );
}

