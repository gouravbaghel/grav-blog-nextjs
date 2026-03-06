import "dotenv/config";
import prisma from "./src/lib/prisma";

async function main() {
    console.log("Generating embedding...");
    // Mock 384-dimensional vector
    const embedding = new Array(384).fill(0.1);

    const posts = await prisma.post.findMany({ take: 1 });
    console.log(`Found ${posts.length} posts`);
    if (posts.length > 0) {
        const post = posts[0];
        try {
            const embeddingStr = `[${embedding.join(',')}]`;
            const res = await prisma.$executeRaw`
         UPDATE "Post"
         SET embedding = ${embeddingStr}::vector
         WHERE id = ${post.id};
      `;
            console.log("Update success:", res);
        } catch (e) {
            console.log("Update error:");
            console.error(e);
        }
    }
}
main().catch(console.error);
