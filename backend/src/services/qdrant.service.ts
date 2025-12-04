import { QdrantClient } from "@qdrant/js-client-rest";
import { ApiError } from "../utils/apiError.util.js";
import type { IMovieEmbedding } from "../interfaces/movie.interface.js";

// Ensure enum values match Qdrant API expectations exactly
export enum Distance {
  Cosine = "Cosine",
  Euclidean = "Euclid",
  Dot = "Dot",
  Manhattan = "Manhattan",
}

const embeddingDimension =
  Number(process.env.QDRANT_EMBEDDING_DIMENSION) || 5000;

export class QdrantClientService {
  private client: QdrantClient;

  constructor() {
    this.client = new QdrantClient({
      host: process.env.QDRANT_HOST,
      port: Number(process.env.QDRANT_PORT),
    });
  }

  #handleError(error: any, context: string) {
    // FIX: Log the actual data from Qdrant to see validation errors
    if (error?.data) {
      console.error(
        `[QdrantService] Detailed Error Data:`,
        JSON.stringify(error.data, null, 2)
      );
    }
    console.error(`[QdrantService] Error in ${context}:`, error);

    if (error instanceof ApiError) throw error;
    if (error?.status === 404)
      throw new ApiError(404, "Qdrant resource not found");
    throw new ApiError(
      500,
      `Internal server error: ${error.message || "Unknown"}`
    );
  }

  async recreateCollection(
    collectionName: string = "movies",
    dimension: number = embeddingDimension,
    distance: Distance = Distance.Cosine
  ) {
    try {
      console.log(
        `[QdrantService] Recreating collection '${collectionName}' with dim: ${dimension}...`
      );

      // recreateCollection will delete the existing one if it exists (Safe for seeding)
      await this.client.recreateCollection(collectionName, {
        vectors: { size: dimension, distance: distance },
      });

      return {
        success: true,
        message: `Collection ${collectionName} recreated.`,
      };
    } catch (error) {
      this.#handleError(error, "recreateCollection");
    }
  }

  // Keep createCollection for production initialization checks
  async createCollection(
    collectionName: string = "movies",
    dimension: number = embeddingDimension,
    distance: Distance = Distance.Cosine
  ) {
    try {
      const { collections } = await this.client.getCollections();
      const exists = collections.some((c) => c.name === collectionName);
      if (exists) {
        console.log(`Collection ${collectionName} already exists.`);
        return {
          success: true,
          message: `Collection ${collectionName} already exists.`,
        };
      }
      await this.client.createCollection(collectionName, {
        vectors: { size: dimension, distance: distance },
      });
      return {
        success: true,
        message: `Collection ${collectionName} created.`,
      };
    } catch (error) {
      this.#handleError(error, "createCollection");
    }
  }

  async upsertCollection(collectionName: string, batch: IMovieEmbedding[]) {
    try {
      if (!collectionName)
        throw new ApiError(400, "Collection name is required");
      if (batch.length === 0) return;
      return await this.client.upsert(collectionName, {
        points: batch,
        wait: true,
      });
    } catch (error) {
      this.#handleError(error, "upsertCollection");
    }
  }

  async searchSimilarMovies(
    collectionName: string,
    movieId: number,
    limit = 10
  ) {
    try {
      if (!collectionName) throw new ApiError(400, "Collection name required");
      if (!movieId) throw new ApiError(400, "Movie ID required");

      const result = await this.client.recommend(collectionName, {
        positive: [movieId],
        limit: limit,
        with_payload: true,
        with_vector: false,
      });

      return result.map((p) => ({
        id: Number(p.id),
        score: p.score,
        title: p.payload?.title,
        posterUrl: p.payload?.posterUrl,
        voteAverage: p.payload?.vote_average,
      }));
    } catch (error) {
      this.#handleError(error, "searchSimilarMovies");
    }
  }

  async getPaginatedMovies(collectionName: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    try {
      if (!collectionName) throw new ApiError(400, "Collection name required");

      const result = await this.client.scroll(collectionName, {
        limit,
        offset,
        with_payload: true,
        with_vector: false,
      });

      return result.points.map((p) => ({
        id: Number(p.id),
        title: p.payload?.title,
        posterUrl: p.payload?.posterUrl,
        voteAverage: p.payload?.vote_average,
      }));
    } catch (error) {
      this.#handleError(error, "getPaginatedMovies");
    }
  }
}

export const qdrantService = new QdrantClientService();
