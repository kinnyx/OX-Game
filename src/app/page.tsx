"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data } = useSession();
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">OX (Tic-tac-toe)</h1>

      <div className="mt-6 flex flex-wrap gap-3">
        {!data ? (
          <button
            className="rounded-lg border px-4 py-2"
            onClick={() => signIn("google", { prompt: "select_account" })}
          >
            Sign in with Google
          </button>
        ) : (
          <>
            <Link className="rounded-lg border px-4 py-2" href="/game">
              Play Game
            </Link>
            <Link className="rounded-lg border px-4 py-2" href="/leaderboard">
              Leaderboard
            </Link>
            <button
              className="rounded-lg border px-4 py-2"
              onClick={() => signOut()}
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </main>
  );
}
