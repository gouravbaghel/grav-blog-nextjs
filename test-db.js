require("dotenv").config();
const { generateEmbedding } = require("./src/lib/embeddings.js"); // Wait, this might be ts
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("Generating embedding...");
    const embedding = [0.1, 0.2, 0.3]; // mock to test db connection first

    const posts = await prisma.post.findMany({ take: 1 });
    console.log(`Found ${posts.length} posts`);
    if (posts.length > 0) {
        const post = posts[0];
        try {
            // Need formatted string for vector: '[0.1, 0.2, 0.3]'
            const embeddingStr = `[${embedding.join(',')}]`;
            const res = await prisma.$executeRaw`
         UPDATE "Post"
         SET embedding = ${embeddingStr}::vector
         WHERE id = ${post.id}
      `;
            console.log("Update success:", res);
        } catch (e) {
            console.log("Update error:", e);
        }
    }
}
main().catch(console.error);
