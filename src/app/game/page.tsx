import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import GameClient from "./GameClient";

export const runtime = "nodejs";

export default async function GamePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.playerId) redirect("/");

    const player = await prisma.player.findUnique({
        where: { id: session.user.playerId },
        select: { score: true, winStreak: true, wins: true, losses: true, draws: true, displayName: true, name: true },
    });

    if (!player) redirect("/");

    return <GameClient initialPlayer={player} />
}