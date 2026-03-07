// Single post API - GET, PUT, DELETE
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getReadingTime } from "@/lib/utils";
import { generateEmbedding } from "@/lib/embeddings";
import { hasPrismaErrorCode } from "@/lib/prisma-errors";

interface RouteParams {
    params: Promise<{ postId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { postId } = await params;
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                author: { select: { id: true, name: true, image: true, bio: true } },
                category: true,
                tags: { include: { tag: true } },
                _count: { select: { likes: true, comments: true } },
            },
        });

        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
        return NextResponse.json(post);
    } catch {
        return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { postId } = await params;
        const body = await request.json();
        const { title, slug, content, excerpt, coverImage, categoryId, tagIds, published, featured } = body;

        const readingTime = content ? getReadingTime(content) : undefined;

        // Update tags: delete old and create new
        if (tagIds) {
            await prisma.tagsOnPosts.deleteMany({ where: { postId } });
        }

        const post = await prisma.post.update({
            where: { id: postId },
            data: {
                ...(title && { title }),
                ...(slug && { slug }),
                ...(content && { content }),
                ...(excerpt !== undefined && { excerpt }),
                ...(coverImage !== undefined && { coverImage }),
                ...(readingTime && { readingTime }),
                ...(published !== undefined && { published }),
                ...(featured !== undefined && { featured }),
                ...(categoryId !== undefined && { categoryId: categoryId || null }),
                ...(tagIds && {
                    tags: { create: tagIds.map((tagId: string) => ({ tagId })) },
                }),
            },
            include: {
                author: { select: { name: true, image: true } },
                category: true,
                tags: { include: { tag: true } },
            },
        });

        // Regenerate embedding if relevant text content changed
        if (title !== undefined || content !== undefined || excerpt !== undefined) {
            try {
                const textToEmbed = `${post.title}. ${post.excerpt || ""} ${post.content}`.trim();
                const trimmedText = textToEmbed.substring(0, 8000);
                const embedding = await generateEmbedding(trimmedText);
                const embeddingStr = `[${embedding.join(",")}]`;

                await prisma.$executeRaw`
                    UPDATE "Post"
                    SET embedding = ${embeddingStr}::vector
                    WHERE id = ${post.id};
                `;
            } catch (embErr) {
                console.error("Failed to update embedding:", embErr);
            }
        }

        return NextResponse.json(post);
    } catch (error) {
        if (hasPrismaErrorCode(error, "P2002")) {
            return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
        }
        return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { postId } = await params;
        await prisma.post.delete({ where: { id: postId } });
        return NextResponse.json({ message: "Post deleted" });
    } catch {
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}
