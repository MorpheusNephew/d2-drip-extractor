"use client";

import { signIn, signOut, useSession } from "next-auth/react";

const Auth = ({ status }: { status: string }) =>
  status === "authenticated" ? (
    <button onClick={() => signIn("bungie")}>Log Out</button>
  ) : (
    <button onClick={() => signOut()}>Log In</button>
  );

export default function Home() {
  const { status } = useSession();

  const statusMessage = status === "authenticated" ? "Logged In" : "Logged out";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div>
          <header>
            {statusMessage} - <Auth status={status} />
          </header>
          <h1>D2 Drip Extractor</h1>
          <p>
            Welcome to the D2 Drip Extractor! Here is where you can extract all
            of your drip (armor, shaders, ornaments) in an AI readable format to
            be able to use AI to generate your drip.
          </p>
        </div>
      </main>
    </div>
  );
}
