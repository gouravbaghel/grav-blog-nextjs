import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateEmbedding } from "@/lib/embeddings";

export const maxDuration = 300; // Allow it to run for up to 5 minutes

export async function POST() {
    try {
        console.log("Starting backfill for empty embeddings...");

        // Find posts where embedding is null
        // Since `embedding` is an Unsupported type, we need to use raw query to check for nulls
        // Or simply pull all posts and update them

        const posts = await prisma.post.findMany({
            select: {
                id: true,
                title: true,
                excerpt: true,
                content: true
            }
        });

        let successCount = 0;
        let failCount = 0;

        for (const post of posts) {
            try {
                // Determine text to embed
                const textToEmbed = `${post.title}. ${post.excerpt || ""} ${post.content}`.trim();

                // Optional: Trim to avoid exceeding token limits of the model
                const trimmedText = textToEmbed.substring(0, 8000);

                console.log(`Generating embedding for post: ${post.id}`);
                const embedding = await generateEmbedding(trimmedText);

                // Convert array to pgvector string format '[0.1, 0.2, ...]'
                const embeddingStr = `[${embedding.join(",")}]`;

                // Update the post with raw query
                await prisma.$executeRaw`
                  UPDATE "Post"
                  SET embedding = ${embeddingStr}::vector
                  WHERE id = ${post.id}
                `;

                successCount++;
            } catch (err) {
                console.error(`Failed to generate/update embedding for post ${post.id}:`, err);
                failCount++;
            }
        }

        return NextResponse.json({
            message: "Backfill completed",
            totalProcessed: posts.length,
            success: successCount,
            failed: failCount
        });

    } catch (error) {
        console.error("Backfill route error:", error);
        return NextResponse.json({ error: "Backfill failed" }, { status: 500 });
    }
}
