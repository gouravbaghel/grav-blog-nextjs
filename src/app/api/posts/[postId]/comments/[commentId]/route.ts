// Delete comment API
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface RouteParams {
    params: Promise<{ postId: string; commentId: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { commentId } = await params;
        const comment = await prisma.comment.findUnique({ where: { id: commentId } });

        if (!comment) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        // Only author or admin can delete
        if (comment.authorId !== session.user.id && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.comment.delete({ where: { id: commentId } });
        return NextResponse.json({ message: "Comment deleted" });
    } catch {
        return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
    }
}
