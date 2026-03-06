import { pipeline, env } from "@xenova/transformers";

// Optional: Configure transformers to run locally and not hit the Hub if models are cached
env.allowLocalModels = false; // We'll download from HF on first run, then cache

// Singleton pipeline to ensure we only load the model once per server process
class PipelineSingleton {
    static task = "feature-extraction";
    static model = "Xenova/all-MiniLM-L6-v2";
    static instance: any = null;

    static async getInstance(progress_callback?: any) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

/**
 * Generate an embedding vector for the given text.
 * @param text The input text to embed.
 * @returns A flat array of numbers representing the embedding vector.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const extractor = await PipelineSingleton.getInstance();

        // Generate embeddings
        const output = await extractor(text, { pooling: "mean", normalize: true });

        // The output is a Tensor, we convert it to a standard JS array
        return Array.from(output.data);
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
}
