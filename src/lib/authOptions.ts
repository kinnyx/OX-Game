import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    session: {
        strategy: "jwt",
    },

    callbacks: {
        async jwt({ token, account, profile }) {
            if (account) {
                const oauthProvider = account.provider;
                const oauthAccountId = account.providerAccountId;

                const player = await prisma.player.upsert({
                    where: {
                        provider_account_unique: {
                            oauthProvider,
                            oauthAccountId,
                        },
                    },
                    update: {
                        email: (profile as any)?.email ?? null,
                        name: (profile as any)?.name ?? null,
                        image: (profile as any)?.picture ?? null,
                    },
                    create: {
                        oauthProvider,
                        oauthAccountId,
                        email: (profile as any)?.email ?? null,
                        name: (profile as any)?.name ?? null,
                        image: (profile as any)?.picture ?? null,
                        score: 0,
                        winStreak: 0,
                    },
                    select: { id: true },
                });

                token.playerId = player.id;
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user && token.playerId) {
                session.user.playerId = token.playerId;
            }

            return session;
        },
    },
};