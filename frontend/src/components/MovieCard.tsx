import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import type { IMovie } from "@/interfaces/MoviesInterfaces.ts";

const MovieCard = ({
  movie,
  onMovieClick,
}: {
  movie: IMovie;
  onMovieClick: (movie: IMovie) => void;
}) => {
  const handleClickedMovie = (movie: IMovie) => {
    onMovieClick(movie);
  };
  return (
    <Card
      onClick={() => handleClickedMovie(movie)}
      className="group w-56 h-72 flex justify-end bg-black/50 hover:bg-blend-overlay transition duration-300 ease-in-out shadow-lg hover:shadow-xl hover:shadow-red-500/60 border-black hover:border-red-500"
      style={{
        backgroundImage: `url(${movie.posterUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <CardFooter className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out flex flex-col items-start text-white gap-2 text-3xl text-left">
        <CardTitle>{movie.title}</CardTitle>
        <CardDescription className="text-red-300">
          ⭐️ {movie.voteAverage} / 10
        </CardDescription>
      </CardFooter>
    </Card>
  );
};

export default MovieCard;
