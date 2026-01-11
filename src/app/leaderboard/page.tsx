import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export default async function LeaderboardPage() {
    const players = await prisma.player.findMany({
        orderBy: [{ score: "desc" }, { wins: "desc" }, { updatedAt: "desc" }],
        select: {
            id: true,
            name: true,
            displayName: true,
            score: true,
            winStreak: true,
            wins: true,
            losses: true,
            draws: true,
        },
    });

    return (
        <main className="mx-auto max-w-5xl p-6">
            <h1 className="text-2xl font-semibold">Leaderboard</h1>

            <div className="mt-4 overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                    <thead className="border-b bg-black/5">
                        <tr className="text-left">
                            <th className="p-3">Player</th>
                            <th className="p-3">Score</th>
                            <th className="p-3">Streak</th>
                            <th className="p-3">W</th>
                            <th className="p-3">L</th>
                            <th className="p-3">D</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((p) => (
                            <tr key={p.id} className="border-b last:border-b-0">
                                <td className="p-3">{p.displayName ?? p.name ?? "Unknown"}</td>
                                <td className="p-3 font-semibold">{p.score}</td>
                                <td className="p-3">{p.winStreak}</td>
                                <td className="p-3">{p.wins}</td>
                                <td className="p-3">{p.losses}</td>
                                <td className="p-3">{p.draws}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    )
}