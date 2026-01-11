"use client";

import { useMemo, useState } from "react";
import type { Board } from "@/lib/tictactoe";
import { getBotMove, getWinner } from "@/lib/tictactoe";

type PlayerStats = {
    score: number;
    winStreak: number;
    wins: number;
    losses: number;
    draws: number;
    displayName: string | null;
    name: string | null;
};

function CellButton({ value, onClick, disabled }: { value: string | null; onClick: () => void; disabled: boolean }) {
    return (
        <button
            className="flex h-20 w-20 items-center justify-center rounded-xl border text-3xl font-semibold"
            onClick={onClick}
            disabled={disabled}
        >
            {value ?? ""}
        </button>
    )
}

export default function GameClient({ initialPlayer }: { initialPlayer: PlayerStats }) {
    const [board, setBoard] = useState<Board>(Array(9).fill(null));
    const [busy, setBusy] = useState(false);
    const [stats, setStats] = useState(initialPlayer);
    const [reported, setReported] = useState(false);

    const winner = useMemo(() => getWinner(board), [board]);

    async function reportResult(result: "WIN" | "LOSS" | "DRAW") {
        if (reported) return;
        setReported(true);

        const res = await fetch("/api/game/finish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ result, moves: board }),
        });

        const data = await res.json();
        if (data?.player) setStats({ ...stats, ...data.player });
    }

    async function handlePlayerMove(i: number) {
        if (busy) return;
        if (winner) return;
        if (board[i] !== null) return;

        const next = board.slice();
        next[i] = "X";
        setBoard(next);

        const w1 = getWinner(next);
        if (w1 === "X") return reportResult("WIN");
        if (w1 === "DRAW") return reportResult("DRAW");

        setBusy(true);

        setTimeout(() => {
            const botIndex = getBotMove(next);
            if (botIndex === null) {
                setBusy(false);
                return;
            }

            const afterBoth = next.slice();
            afterBoth[botIndex] = "O";
            setBoard(afterBoth);
            setBusy(false);

            const w2 = getWinner(afterBoth);
            if (w2 === "O") reportResult("LOSS");
            else if (w2 === "DRAW") reportResult("DRAW");
        }, 250);
    }

    function resetGame() {
        setBoard(Array(9).fill(null));
        setBusy(false);
        setReported(false);
    }

    return (
        <main className="mx-auto max-w-4xl p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Play OX vs Bot</h1>
                    <p className="mt-1 text-sm opacity-80">
                        ชนะ +1, แพ้ -1, ชนะติดกันครบ 3 ได้โบนัส +1 และรีเซ็ตสตรีค
                    </p>
                </div>

                <button className="rounded-lg border px-4 py-2" onClick={resetGame}>
                    New Game
                </button>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
                <section className="rounded-2xl border p-4">
                    <h2 className="font-semibold">Score</h2>
                    <div className="mt-2 text-sm">
                        <div>Player: {stats.displayName ?? stats.name ?? "Unknown"}</div>
                        <div className="mt-1">Score: <span className="font-semibold">{stats.score}</span></div>
                        <div>Win Streak: {stats.winStreak}</div>
                        <div className="mt-1">W: {stats.wins} / L: {stats.losses} / D: {stats.draws}</div>
                    </div>

                    <div className="mt-4 rounded-xl bg-black/5 p-3 text-sm">
                        Status:{" "}
                        {!winner ? (busy ? "Bot thinking..." : "Your turn (X)") : winner === "X" ? "You win!" : winner === "O" ? "You lose!" : "Draw"}
                    </div>
                </section>

                <section className="rounded-2xl border p-4">
                    <h2 className="font-semibold">Board</h2>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                        {board.map((v, i) => (
                            <CellButton 
                                key={i}
                                value={v}
                                disabled={busy || !!winner || v !== null}
                                onClick={() => handlePlayerMove(i)}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}