import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const BodySchema = z.object({
    result: z.enum(["WIN", "LOSS", "DRAW"]),
    moves: z.any().optional(),
});

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.playerId) {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const bodyJson = await req.json();
    const parsed = BodySchema.safeParse(bodyJson);
    if (!parsed.success) {
        return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
    }

    const playerId = session.user.playerId;
    const { result, moves } = parsed.data;

    const updated = await prisma.$transaction(async (tx) => {
        await tx.game.create({
            data: {
                playerId,
                result,
                moves: moves ?? null,
            },
        });

        const player = await tx.player.findUnique({
            where: { id: playerId },
            select: { score: true, winStreak: true, wins: true, losses: true, draws: true },
        });

        if (!player) throw new Error("PLAYER_NOT_FOUND");

        let scoreDelta = 0;
        let nextStreak = player.winStreak;
        let wins = player.wins;
        let losses = player.losses;
        let draws = player.draws;

        if (result === "WIN") {
            scoreDelta += 1;
            nextStreak += 1;
            wins += 1;

            if (nextStreak === 3) {
                scoreDelta += 1;
                nextStreak = 0;
            }
        } else if (result === "LOSS") {
            scoreDelta -= 1;
            nextStreak = 0;
            losses += 1;
        } else {
            nextStreak = 0;
            draws += 1;
        }

        return tx.player.update({
            where: { id: playerId },
            data: {
                score: player.score + scoreDelta,
                winStreak: nextStreak,
                wins,
                losses,
                draws,
            },
            select: { score: true, winStreak: true, wins: true, losses: true, draws: true },
        });
    });

    return NextResponse.json({ ok: true, player: updated });
}