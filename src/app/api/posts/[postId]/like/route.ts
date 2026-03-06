// Like/Unlike API
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface RouteParams {
    params: Promise<{ postId: string }>;
}

// POST - Like a post
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { postId } = await params;

        const existing = await prisma.like.findUnique({
            where: { userId_postId: { userId: session.user.id, postId } },
        });

        if (existing) {
            return NextResponse.json({ error: "Already liked" }, { status: 409 });
        }

        await prisma.like.create({
            data: { userId: session.user.id, postId },
        });

        return NextResponse.json({ message: "Liked" }, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to like" }, { status: 500 });
    }
}

// DELETE - Unlike a post
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { postId } = await params;

        await prisma.like.delete({
            where: { userId_postId: { userId: session.user.id, postId } },
        });

        return NextResponse.json({ message: "Unliked" });
    } catch {
        return NextResponse.json({ error: "Failed to unlike" }, { status: 500 });
    }
}
