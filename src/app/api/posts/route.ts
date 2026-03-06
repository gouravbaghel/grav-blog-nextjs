// Posts API - GET (list with pagination, search, filtering)
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getReadingTime } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { generateEmbedding } from "@/lib/embeddings";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("q") || "";
        const category = searchParams.get("category") || "";
        const tag = searchParams.get("tag") || "";

        const where: Record<string, unknown> = { published: true };

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { content: { contains: search, mode: "insensitive" } },
            ];
        }
        if (category) where.category = { slug: category };
        if (tag) where.tags = { some: { tag: { slug: tag } } };

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where: where as any,
                include: {
                    author: { select: { name: true, image: true } },
                    category: { select: { name: true, slug: true, color: true } },
                    tags: { include: { tag: true } },
                    _count: { select: { likes: true, comments: true } },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.post.count({ where: where as any }),
        ]);

        return NextResponse.json({
            posts,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}

// POST - Create new post (admin only)
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, slug, content, excerpt, coverImage, categoryId, tagIds, published, featured } = body;

        if (!title || !slug || !content) {
            return NextResponse.json({ error: "Title, slug, and content are required" }, { status: 400 });
        }

        const readingTime = getReadingTime(content);

        const post = await prisma.post.create({
            data: {
                title,
                slug,
                content,
                excerpt,
                coverImage,
                readingTime,
                published: published ?? false,
                featured: featured ?? false,
                authorId: session.user.id,
                categoryId: categoryId || null,
                tags: tagIds?.length
                    ? { create: tagIds.map((tagId: string) => ({ tagId })) }
                    : undefined,
            },
            include: {
                author: { select: { name: true, image: true } },
                category: true,
                tags: { include: { tag: true } },
            },
        });

        // Generate embedding
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
            console.error("Failed to generate embedding for new post:", embErr);
        }

        return NextResponse.json(post, { status: 201 });
    } catch (error: any) {
        if (error?.code === "P2002") {
            return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}
