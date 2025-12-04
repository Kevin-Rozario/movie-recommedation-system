import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { axiosInstance } from "@/config/axios.config";
import type { IMovie, IMovieMetadata } from "@/interfaces/MoviesInterfaces.ts";
import RecommendedMovies from "./RecommendedMovies";

const CustomModal = ({
  isClicked,
  setIsClicked,
  movie,
}: {
  isClicked: boolean;
  setIsClicked: () => void;
  movie: IMovie;
}) => {
  const [detailedMovie, setDetailedMovie] = useState<IMovieMetadata | null>(
    null
  );
  const [recommendedMovies, setRecommendedMovies] = useState<IMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If the modal is closing, clear the data. If it's opening and we don't have data, fetch it.
    if (!isClicked) {
      setDetailedMovie(null);
      return;
    }

    const fetchMovieDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch detailed metadata for the selected movie
        const detailsResponse = await axiosInstance.get(`/movies/${movie.id}`);
        setDetailedMovie(detailsResponse.data.data);

        // Fetch recommendations
        const recommendationsResponse = await axiosInstance.get(
          `/movies/${movie.id}/recommendations`
        );

        setRecommendedMovies(recommendationsResponse.data.data.slice(0, 5));
      } catch (error) {
        console.error(`Error fetching movie data for ID ${movie.id}: `, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [isClicked, movie.id]);

  // Helper function to format runtime
  const formatRuntime = (minutes: number | null) => {
    if (!minutes || minutes === 0) return "N/A";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return amount ? `$${amount.toLocaleString()}` : "N/A";
  };

  return (
    <Dialog open={isClicked} onOpenChange={setIsClicked}>
      <DialogContent
        className="
      bg-black/90 text-gray-100 border-2 border-red-700 shadow-2xl shadow-red-900/50 
      flex flex-col h-[80vh] w-[70vw] p-8 
      max-w-none sm:max-w-none 
    "
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500 font-bold text-2xl animate-pulse">
            <span className="text-4xl">⚡</span>
            <p className="mt-4">Loading Data ...</p>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-y-scroll no-scrollbar">
            <div>
              {/* Poster and Basic Info Section */}
              <div className="flex gap-8 mb-6 border-b border-red-700/50 pb-6">
                <div className="shrink-0">
                  <div
                    style={{
                      backgroundImage: `url(${movie.posterUrl})`,
                    }}
                    className="
                    w-60 h-80 rounded-lg shadow-xl shadow-red-500/30
                    bg-cover bg-center border border-red-700
                  "
                  ></div>
                </div>

                <div className="flex flex-col justify-start w-full">
                  {/* Title */}
                  <DialogTitle
                    className="
                  text-5xl font-extrabold text-red-500 tracking-wider 
                  uppercase mb-2
                "
                  >
                    {movie.title}
                  </DialogTitle>

                  {/* Tagline / Subtitle */}
                  <DialogDescription className="text-red-300 italic text-lg mb-4">
                    {detailedMovie?.tagline || "Enter the Gate..."}
                  </DialogDescription>

                  {/* Key Stats */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                    <span className="bg-red-900/50 text-red-200 px-3 py-1 rounded-full font-semibold border border-red-700">
                      ⭐️ {movie.voteAverage} / 10
                    </span>
                    <span className="bg-gray-800/50 text-gray-300 px-3 py-1 rounded-full">
                      ⏰ {formatRuntime(detailedMovie?.runtime || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Overview and Details Section */}
              <div className="overflow-y-auto pr-4 flex flex-col gap-4 custom-scrollbar">
                {/* Overview */}
                <div className="mb-4">
                  <h3 className="text-2xl text-justify font-bold text-red-500 mb-2 border-b border-red-700/50">
                    Overview
                  </h3>
                  <DialogDescription className="text-gray-300 leading-relaxed text-base">
                    {detailedMovie?.overview ||
                      "No transmission received from this dimension."}
                  </DialogDescription>
                </div>

                {/* Cast & Director */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-red-500 mb-1">
                      Director
                    </h3>
                    <p className="text-gray-300">
                      {detailedMovie?.director || "Unknown Entity"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-500 mb-1">
                      Starring
                    </h3>
                    <p className="text-gray-300 line-clamp-2">
                      {detailedMovie?.cast?.slice(0, 4).join(", ") ||
                        "The Hawkins Crew"}
                    </p>
                  </div>
                </div>

                {/* Genres & Production */}
                <div className="mt-4">
                  <h3 className="text-xl font-bold text-red-500 mb-2">
                    Genres
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {detailedMovie?.genres?.map((genre, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-medium px-3 py-1 bg-red-800/70 text-gray-100 rounded-lg border border-red-500/80"
                      >
                        {genre}
                      </span>
                    )) || (
                      <span className="text-gray-500">
                        Classification pending...
                      </span>
                    )}
                  </div>
                </div>

                {/* Financials */}
                <div className="mt-4">
                  <h3 className="text-xl font-bold text-red-500 mb-2">
                    Financial Report (Classified)
                  </h3>
                  <p className="text-gray-300 text-sm font-semibold">
                    Budget: {formatCurrency(detailedMovie?.budget || 0)}
                    <span className="mx-2 text-red-700">|</span>
                    Revenue: {formatCurrency(detailedMovie?.revenue || 0)}
                  </p>
                </div>
              </div>
            </div>
            <RecommendedMovies recommendedMovies={recommendedMovies} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;
