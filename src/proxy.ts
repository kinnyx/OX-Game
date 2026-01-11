import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
    const isProtected =
        req.nextUrl.pathname.startsWith("/game") ||
        req.nextUrl.pathname.startsWith("/leaderboard");

        if (!isProtected) return NextResponse.next();

        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token) {
            const url = req.nextUrl.clone();
            url.pathname = "/";
            return NextResponse.redirect(url);
        }

        return NextResponse.next();
}

export const config = {
    matcher: ["/game/:patch*", "/leaderboard/:path*"],
}