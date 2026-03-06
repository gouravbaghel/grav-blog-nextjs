// Admin stats API
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [posts, comments, likes, viewsResult] = await Promise.all([
            prisma.post.count(),
            prisma.comment.count(),
            prisma.like.count(),
            prisma.post.aggregate({ _sum: { views: true } }),
        ]);

        return NextResponse.json({
            posts,
            comments,
            likes,
            views: viewsResult._sum.views || 0,
        });
    } catch {
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
