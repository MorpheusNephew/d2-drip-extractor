"use client";

import { signIn, signOut, useSession } from "next-auth/react";

const Auth = ({ status }: { status: string }) =>
  status === "authenticated" ? (
    <button onClick={() => signOut()}>Log Out</button>
  ) : (
    <button onClick={() => signIn("bungie")}>Log In</button>
  );

const Header = () => {
  const { data: session, status } = useSession();

  const statusMessage =
    status === "authenticated"
      ? `Logged In (${session.user?.name})`
      : "Logged out";

  return (
    <header>
      {statusMessage} - <Auth status={status} />
    </header>
  );
};

export default Header;
