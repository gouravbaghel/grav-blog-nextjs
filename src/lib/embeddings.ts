import { pipeline, env, PipelineType } from "@xenova/transformers";

// Configure transformers behavior
env.allowLocalModels = false;

// Singleton pipeline so the model loads only once
class PipelineSingleton {
  static task = "feature-extraction";
  static model = "Xenova/all-MiniLM-L6-v2";
  static instance: any = null;

  static async getInstance(progress_callback?: any) {
    if (this.instance === null) {
      this.instance = await pipeline(
        this.task,
        this.model,
        { progress_callback }
      );
    }
    return this.instance;
  }
}

/**
 * Generate an embedding vector for the given text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const extractor = await PipelineSingleton.getInstance();

    const output = await extractor(text, {
      pooling: "mean",
      normalize: true,
    });

    return Array.from(output.data);
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}
