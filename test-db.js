async function main() {
    await import("dotenv/config");
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    console.log("Generating embedding...");
    const embedding = [0.1, 0.2, 0.3];

    const posts = await prisma.post.findMany({ take: 1 });
    console.log(`Found ${posts.length} posts`);
    if (posts.length > 0) {
        const post = posts[0];
        try {
            const embeddingStr = `[${embedding.join(",")}]`;
            const res = await prisma.$executeRaw`
                UPDATE "Post"
                SET embedding = ${embeddingStr}::vector
                WHERE id = ${post.id}
            `;
            console.log("Update success:", res);
        } catch (error) {
            console.log("Update error:", error);
        }
    }

    await prisma.$disconnect();
}

main().catch(console.error);
