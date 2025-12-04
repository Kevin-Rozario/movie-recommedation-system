import * as fs from "node:fs";
import * as readline from "readline";
import axios from "axios";

// Configuration
const METADATA_FILE = process.env.MOVIES_METADATA_FILE;
const POSTER_CACHE_FILE =
  process.env.POSTER_CACHE_FILE || "./data/poster-cache.json";
const TMDB_READ_ACCESS_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN;
const CONCURRENT_REQUESTS = 30; // Adjust based on TMDB rate limits
const RATE_LIMIT_DELAY = 100; // Milliseconds between batches

// Main function
(async () => {
  if (!METADATA_FILE || !fs.existsSync(METADATA_FILE)) {
    console.error(
      "Error: Metadata file path is not set or file does not exist."
    );
    process.exit(1);
  }
  if (!TMDB_READ_ACCESS_TOKEN) {
    console.error(
      "Error: TMDB_READ_ACCESS_TOKEN environment variable is not set."
    );
    process.exit(1);
  }

  console.log("Starting poster fetching process...");
  const startTime = Date.now();

  try {
    const posterCache: { [id: string]: string | null } = {};

    // Load existing cache if available
    if (fs.existsSync(POSTER_CACHE_FILE)) {
      Object.assign(
        posterCache,
        JSON.parse(fs.readFileSync(POSTER_CACHE_FILE, "utf8"))
      );
      console.log(`Loaded ${Object.keys(posterCache).length} cached posters`);
    }

    // Read all movie IDs from metadata
    console.log("Reading movie metadata...");
    const movieIds: number[] = [];
    const rl = readline.createInterface({
      input: fs.createReadStream(METADATA_FILE),
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      if (line.trim()) {
        try {
          const movie = JSON.parse(line);
          if (!posterCache[movie.id]) {
            movieIds.push(movie.id);
          }
        } catch (e) {
          console.error(`Error parsing metadata line: ${e}`);
        }
      }
    }

    console.log(`Found ${movieIds.length} movies needing poster data`);

    if (movieIds.length === 0) {
      console.log("All posters already cached!");
      return;
    }

    // Fetch posters in controlled batches
    let successCount = 0;
    let errorCount = 0;
    let notFoundCount = 0;

    for (let i = 0; i < movieIds.length; i += CONCURRENT_REQUESTS) {
      const batch = movieIds.slice(i, i + CONCURRENT_REQUESTS);

      const results = await Promise.allSettled(
        batch.map(async (id) => {
          try {
            const response = await axios.get(
              `https://api.themoviedb.org/3/movie/${id}`,
              {
                headers: {
                  Authorization: `Bearer ${TMDB_READ_ACCESS_TOKEN}`,
                  Accept: "application/json",
                },
                timeout: 10000,
              }
            );
            return { id, posterPath: response.data.poster_path };
          } catch (error: any) {
            if (error.response?.status === 404) {
              return { id, posterPath: null, notFound: true };
            }
            throw error;
          }
        })
      );

      // Process results
      results.forEach((result, index) => {
        const movieId = batch[index];
        if (result.status === "fulfilled") {
          const { posterPath, notFound } = result.value;
          posterCache[movieId] = posterPath;

          if (notFound) {
            notFoundCount++;
          } else if (posterPath) {
            successCount++;
          }
        } else {
          console.error(
            `Error fetching poster for movie ID ${movieId}:`,
            result.reason?.message
          );
          posterCache[movieId] = null;
          errorCount++;
        }
      });

      // Save progress periodically (every 10 batches)
      if ((i / CONCURRENT_REQUESTS) % 10 === 0) {
        fs.writeFileSync(
          POSTER_CACHE_FILE,
          JSON.stringify(posterCache, null, 2)
        );
        const progress = Math.min(i + CONCURRENT_REQUESTS, movieIds.length);
        console.log(
          `Progress: ${progress}/${movieIds.length} (${(
            (progress / movieIds.length) *
            100
          ).toFixed(1)}%)`
        );
      }

      // Rate limiting delay
      if (i + CONCURRENT_REQUESTS < movieIds.length) {
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
      }
    }

    // Final save
    fs.writeFileSync(POSTER_CACHE_FILE, JSON.stringify(posterCache, null, 2));

    const duration = (Date.now() - startTime) / 1000;
    console.log("\n-------------------------------------------");
    console.log("Poster fetching complete!");
    console.log(`Total posters cached: ${Object.keys(posterCache).length}`);
    console.log(`Successfully fetched: ${successCount}`);
    console.log(`Not found (404): ${notFoundCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Time taken: ${duration.toFixed(2)} seconds`);
    console.log(`Cache saved to: ${POSTER_CACHE_FILE}`);
    console.log("-------------------------------------------");
  } catch (error) {
    console.error("\nA critical error occurred:", error);
    process.exit(1);
  }
})();
