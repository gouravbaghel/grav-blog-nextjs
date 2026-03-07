import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface SearchPostRow {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    readingTime: number | null;
    createdAt: Date;
    views: number;
    authorName: string | null;
    authorImage: string | null;
    categoryName: string | null;
    categorySlug: string | null;
    categoryColor: string | null;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get("q");

        if (!query) {
            return NextResponse.json({ error: "Search query is required" }, { status: 400 });
        }

        // Generate embedding for the search query
        const { generateEmbedding } = await import("@/lib/embeddings");
        const queryEmbedding = await generateEmbedding(query);

        // Convert array to pgvector string format '[0.1, 0.2, ...]'
        const embeddingStr = `[${queryEmbedding.join(",")}]`;

        // Perform a vector similarity search using Prisma's $queryRaw
        // <-> is the L2 distance operator for pgvector
        // We order by distance ascending (closest first)

        const posts = await prisma.$queryRaw<SearchPostRow[]>`
            SELECT 
                p.id, 
                p.title, 
                p.slug, 
                p.excerpt, 
                p."coverImage", 
                p."readingTime", 
                p."createdAt",
                p."views",
                u.name as "authorName",
                u.image as "authorImage",
                c.name as "categoryName",
                c.slug as "categorySlug",
                c.color as "categoryColor"
            FROM "Post" p
            LEFT JOIN "User" u ON p."authorId" = u.id
            LEFT JOIN "Category" c ON p."categoryId" = c.id
            WHERE p.published = true AND p.embedding IS NOT NULL
            ORDER BY p.embedding <-> ${embeddingStr}::vector
            LIMIT 10;
        `;

        // We need to parse dates back to ISO strings or let JSON.stringify handle it
        // The results come back flat from raw query, so we map them to match the expected format on the frontend

        const formattedPosts = posts.map((post) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            coverImage: post.coverImage,
            readingTime: post.readingTime,
            createdAt: post.createdAt,
            views: post.views,
            author: {
                name: post.authorName,
                image: post.authorImage
            },
            category: post.categoryName ? {
                name: post.categoryName,
                slug: post.categorySlug,
                color: post.categoryColor
            } : null,
            // Tags are complex in raw queries without aggregations, omitting them or stubbing
            tags: []
        }));

        return NextResponse.json({ posts: formattedPosts });

    } catch (error) {
        console.error("Search API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
