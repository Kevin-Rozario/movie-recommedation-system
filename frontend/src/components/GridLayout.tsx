import MovieCard from "./MovieCard";
import type { IMovie } from "@/interfaces/MoviesInterfaces";

const GridLayout = ({
  movies,
  onMovieClick,
}: {
  movies: IMovie[];
  onMovieClick: (movie: IMovie) => void;
}) => {
  return (
    <div className="grid grid-cols-5 place-items-center gap-y-7">
      {movies.map((movie, idx) => (
        <MovieCard key={idx} movie={movie} onMovieClick={onMovieClick} />
      ))}
    </div>
  );
};

export default GridLayout;
