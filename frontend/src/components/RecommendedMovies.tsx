import React from "react";
import MovieCard from "./MovieCard";
import type { IMovie } from "@/interfaces/MoviesInterfaces.ts";

interface RecommendedMoviesProps {
  recommendedMovies: IMovie[];
}

const RecommendedMovies: React.FC<RecommendedMoviesProps> = ({
  recommendedMovies,
}) => {
  const handleMovieClick = (movie: IMovie) => {
    console.log("Clicked movie:", movie);
  };
  if (recommendedMovies.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 italic">
        Waiting for signals...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-center mt-5">
      <p className="text-2xl font-semibold text-red-500">You may also like</p>
      <div className="w-full overflow-x-scroll mt-3 flex gap-4 no-scrollbar p-2">
        {recommendedMovies.map((movie: IMovie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onMovieClick={handleMovieClick}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendedMovies;
