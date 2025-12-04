import type { Request, Response } from "express";
import { qdrantService } from "../services/qdrant.service.js";
import { firebaseAdminService } from "../services/firebase.service.js";
import { ApiError } from "../utils/apiError.util.js";
import { ApiResponse } from "../utils/apiResponse.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

const COLLECTION_NAME = "movies";

class MovieController {
  /**
   * GET: /api/movies?page=1&limit=20
   * Fetches a paginated list of movies with lean data from Qdrant.
   */
  public getMovies = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    // Prevent fetching too many records at once
    if (limit > 40) {
      throw new ApiError(400, "Limit cannot exceed 100 items");
    }

    if (isNaN(page) || isNaN(limit)) {
      throw new ApiError(400, "Invalid page or limit format");
    }

    const movies = await qdrantService.getPaginatedMovies(
      COLLECTION_NAME,
      page,
      limit
    );

    res
      .status(200)
      .json(new ApiResponse(200, "Movies fetched successfully", movies || []));
  });

  /**
   * GET: /api/movies/:id
   * Fetches rich, detailed metadata for a single movie from Firebase.
   */
  public getMovieById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const movieId = Number(id);

    if (isNaN(movieId)) {
      throw new ApiError(400, "Invalid Movie ID format");
    }

    // Fetch from Firebase
    const movie = await firebaseAdminService.getMovieById(movieId);

    if (!movie) {
      throw new ApiError(404, "Movie not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, "Movie fetched successfully", movie));
  });

  /**
   * GET /api/movies/:id/recommendations
   * Fetches a list of similar movies based on vector embeddings from Qdrant.
   */
  public getMovieRecommendations = asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const limit = Number(req.query.limit) || 10;

      if (!id) throw new ApiError(400, "Movie ID is required");

      const movieId = Number(id);
      if (isNaN(movieId)) throw new ApiError(400, "Invalid Movie ID format");

      // Fetch recommendations based on the ID stored in Qdrant
      const recommendations = await qdrantService.searchSimilarMovies(
        COLLECTION_NAME,
        movieId,
        limit
      );

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Recommendations fetched successfully",
            recommendations || []
          )
        );
    }
  );
}

export const movieController = new MovieController();
