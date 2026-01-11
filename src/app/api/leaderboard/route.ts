import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
    const players = await prisma.player.findMany({
        orderBy: [{ score: "desc" }, { wins: "desc" }, { updatedAt: "desc" }],
        select: {
            id: true,
            name: true,
            displayName: true,
            email: true,
            score: true,
            winStreak: true,
            wins: true,
            losses: true,
            draws: true,
            updatedAt: true,
        },
    });

    return NextResponse.json({players });
}