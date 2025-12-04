import * as fs from "node:fs";
import * as readline from "readline";
import axios from "axios";
import { qdrantService, Distance } from "../services/qdrant.service.js";
import { firebaseAdminService } from "../services/firebase.service.js";
import type {
  IMovieEmbedding,
  IMovieMetadata,
} from "../interfaces/movie.interface.js";

// Configuration
const COLLECTION_NAME = "movies";
const EMBEDDING_FILE = process.env.MOVIES_EMBEDDING_FILE;
const METADATA_FILE = process.env.MOVIES_METADATA_FILE;
const POSTER_CACHE_FILE =
  process.env.POSTER_CACHE_FILE || "./data/poster-cache.json";
const TMDB_READ_ACCESS_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN;
const BATCH_SIZE = 90;

// Poster cache
let posterCache: { [id: string]: string | null } = {};

// Main seeding function
(async () => {
  // 1. Validation
  if (!EMBEDDING_FILE || !fs.existsSync(EMBEDDING_FILE)) {
    console.error(
      `Error: Embedding file path is not set or file does not exist.`
    );
    process.exit(1);
  }
  if (!METADATA_FILE || !fs.existsSync(METADATA_FILE)) {
    console.error(
      `Error: Metadata file path is not set or file does not exist.`
    );
    process.exit(1);
  }
  if (!TMDB_READ_ACCESS_TOKEN) {
    console.error(
      `Error: TMDB_READ_ACCESS_TOKEN environment variable is not set.`
    );
    process.exit(1);
  }

  console.log("Starting unified seeding process for Qdrant and Firebase...");
  const startTime = Date.now();

  try {
    // 2. Load poster cache
    console.log("Loading poster cache...");
    if (fs.existsSync(POSTER_CACHE_FILE)) {
      posterCache = JSON.parse(fs.readFileSync(POSTER_CACHE_FILE, "utf8"));
      console.log(`Loaded ${Object.keys(posterCache).length} cached posters`);
    } else {
      console.warn(
        "Poster cache file not found. Run the fetch-posters script first for optimal performance."
      );
      console.warn("Continuing without posters...");
    }

    // 3. Prepare Databases
    console.log("Determining vector dimension from file...");
    const dimension = await getVectorDimension(EMBEDDING_FILE);
    console.log(`Detected vector dimension: ${dimension}`);

    console.log("Preparing Qdrant collection...");
    await qdrantService.recreateCollection(
      COLLECTION_NAME,
      dimension,
      Distance.Cosine
    );

    console.log("Firebase Admin SDK initialized.");

    // 4. Load All Data into Memory
    console.log("Loading all movie data into memory...");
    const allMovies = await loadAndMergeData();
    console.log(`Loaded a total of ${Object.keys(allMovies).length} movies.`);

    // 5. Process and Upsert in Batches
    let totalCount = 0;
    const movieIds = Object.keys(allMovies);

    for (let i = 0; i < movieIds.length; i += BATCH_SIZE) {
      const batchIds = movieIds.slice(i, i + BATCH_SIZE);
      const batchData = batchIds.map((id) => allMovies[id]);

      const qdrantBatch: IMovieEmbedding[] = [];
      const firebaseBatch: IMovieMetadata[] = [];

      // Process batch data
      for (const movie of batchData) {
        if (!movie?.embedding) continue;

        // Get poster from cache (no API calls during seeding)
        const posterPath = posterCache[movie.metadata.id] || null;
        const posterUrl = posterPath
          ? `https://image.tmdb.org/t/p/w500/${posterPath}`
          : null;

        qdrantBatch.push({
          id: movie.metadata.id,
          vector: movie.embedding.vector,
          payload: {
            title: movie.embedding.payload.title,
            posterUrl: posterUrl,
            vote_average: movie.embedding.payload["vote_average"],
          },
        });

        firebaseBatch.push(movie.metadata);
      }

      // Upsert to Qdrant
      if (qdrantBatch.length > 0) {
        await qdrantService.upsertCollection(COLLECTION_NAME, qdrantBatch);
      }

      // Upsert to Firebase (optimized batching)
      if (firebaseBatch.length > 0) {
        for (const movie of firebaseBatch) {
          firebaseAdminService.addMovieToBatch(movie); // Remove await
        }
        await firebaseAdminService.commitBatch();
      }

      totalCount += batchIds.length;
      console.log(`\nCHECKPOINT: Processed ${totalCount} movies...`);
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log("\n-------------------------------------------");
    console.log(`Seeding successful!`);
    console.log(`Total documents processed: ${totalCount}`);
    console.log(`Time taken: ${duration.toFixed(2)} seconds`);
    console.log("-------------------------------------------");
  } catch (error) {
    console.error(
      "\nA critical error occurred during the seeding process:",
      error
    );
    process.exit(1);
  }
})();

// Helper functions
async function getVectorDimension(filePath: string): Promise<number> {
  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.trim()) {
      try {
        const data: IMovieEmbedding = JSON.parse(line);
        if (Array.isArray(data.vector)) {
          rl.close();
          stream.destroy();
          return data.vector.length;
        }
      } catch (e) {}
    }
  }
  return Number(process.env.QDRANT_EMBEDDING_DIMENSION) || 5000;
}

async function loadAndMergeData(): Promise<{
  [id: string]: { metadata: IMovieMetadata; embedding?: IMovieEmbedding };
}> {
  const allMovies: {
    [id: string]: { metadata: IMovieMetadata; embedding?: IMovieEmbedding };
  } = {};

  // Read metadata file
  const rlMeta = readline.createInterface({
    input: fs.createReadStream(METADATA_FILE!),
    crlfDelay: Infinity,
  });
  for await (const line of rlMeta) {
    if (line.trim()) {
      try {
        const movie: IMovieMetadata = JSON.parse(line);
        allMovies[movie.id] = { metadata: movie };
      } catch (e) {
        console.error(`Error parsing metadata JSON line: ${e}`);
      }
    }
  }

  // Read embedding file and merge
  const rlEmbed = readline.createInterface({
    input: fs.createReadStream(EMBEDDING_FILE!),
    crlfDelay: Infinity,
  });
  for await (const line of rlEmbed) {
    if (line.trim()) {
      try {
        const movie: IMovieEmbedding = JSON.parse(line);
        if (allMovies[movie.id]) {
          allMovies[movie.id].embedding = movie;
        }
      } catch (e) {
        // Silently ignore or log less verbose errors for cleanliness
      }
    }
  }

  return allMovies;
}
