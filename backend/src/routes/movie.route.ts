import { Router } from "express";
import { movieController } from "../controllers/movie.controller.js";

const router = Router();

// Get paginated list
router.route("/").get(movieController.getMovies);

// Get single movie details
router.route("/:id").get(movieController.getMovieById);

// Get recommendations for a specific movie
router
  .route("/:id/recommendations")
  .get(movieController.getMovieRecommendations);

export default router;
