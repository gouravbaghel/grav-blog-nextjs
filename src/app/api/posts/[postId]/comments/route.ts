// Comments API with rate limiting
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // comments per window
const RATE_WINDOW = 60_000; // 1 minute

function checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(userId);

    if (!record || now > record.resetAt) {
        rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW });
        return true;
    }

    if (record.count >= RATE_LIMIT) return false;
    record.count++;
    return true;
}

interface RouteParams {
    params: Promise<{ postId: string }>;
}

// GET - Fetch comments for a post
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { postId } = await params;
        const comments = await prisma.comment.findMany({
            where: { postId, parentId: null },
            include: {
                author: { select: { id: true, name: true, image: true } },
                replies: {
                    include: {
                        author: { select: { id: true, name: true, image: true } },
                        replies: {
                            include: {
                                author: { select: { id: true, name: true, image: true } },
                            },
                            orderBy: { createdAt: "asc" },
                        },
                    },
                    orderBy: { createdAt: "asc" },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(comments);
    } catch {
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}

// POST - Create a new comment
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limiting
        if (!checkRateLimit(session.user.id)) {
            return NextResponse.json(
                { error: "Too many comments. Please wait a moment." },
                { status: 429 }
            );
        }

        const { postId } = await params;
        const { content, parentId } = await request.json();

        if (!content?.trim()) {
            return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
        }

        if (content.length > 2000) {
            return NextResponse.json({ error: "Comment is too long (max 2000 characters)" }, { status: 400 });
        }

        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                authorId: session.user.id,
                postId,
                parentId: parentId || null,
            },
            include: {
                author: { select: { id: true, name: true, image: true } },
            },
        });

        return NextResponse.json(comment, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }
}
