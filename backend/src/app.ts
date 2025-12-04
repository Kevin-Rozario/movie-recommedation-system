import express from "express";
import cors from "cors";
import errorMiddleware from "./middlewares/error.middleware.js";
import moviesRoutes from "./routes/movie.route.js";
import type { Request, Response } from "express";

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);

// Routes
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Movies Recommender API" });
});

app.use("/api/v1/movies", moviesRoutes);

// Handle 404/Not Found Errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler (Must be the last middleware)
app.use(errorMiddleware);

export default app;
