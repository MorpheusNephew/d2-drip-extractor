"use client";

import { signIn, signOut, useSession } from "next-auth/react";

const Auth = ({ status }: { status: string }) =>
  status === "authenticated" ? (
    <button 
      onClick={() => signOut()}
      className="px-6 py-2.5 bg-gradient-to-r from-red-600/80 to-red-500/80 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] border border-red-400/30"
    >
      Sign Out
    </button>
  ) : (
    <button 
      onClick={() => signIn("bungie")}
      className="px-6 py-2.5 bg-gradient-to-r from-[#4a9eff] to-[#00d4ff] hover:from-[#00d4ff] hover:to-[#4a9eff] text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-[#4a9eff]/20 hover:shadow-[#4a9eff]/40 hover:scale-[1.02] active:scale-[0.98] border border-[#4a9eff]/30"
    >
      Connect with Bungie
    </button>
  );

const Header = () => {
  const { data: session, status } = useSession();

  const statusMessage =
    status === "authenticated"
      ? `${session.user?.name}`
      : "Not Connected";

  return (
    <header className="w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-br from-[#0a0e1a]/80 to-[#0d1429]/80 backdrop-blur-sm border border-[#4a9eff]/20 shadow-2xl shadow-[#4a9eff]/5">
        {/* Status Section */}
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${status === "authenticated" ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-gray-500"} animate-pulse`}></div>
          <div className="flex flex-col">
            <span className="text-xs text-[#c5c5c5]/60 uppercase tracking-wider font-medium">Guardian Status</span>
            <span className={`text-sm font-semibold ${status === "authenticated" ? "text-[#4a9eff]" : "text-gray-400"}`}>
              {statusMessage}
            </span>
          </div>
        </div>
        
        {/* Auth Button */}
        <Auth status={status} />
      </div>
    </header>
  );
};

export default Header;
