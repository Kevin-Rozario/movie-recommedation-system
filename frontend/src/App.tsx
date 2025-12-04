import { useEffect, useState } from "react";
import GridLayout from "./components/GridLayout.tsx";
import CustomModal from "./components/CustomModal.tsx";
import { axiosInstance } from "./config/axios.config.ts";
import type { IMovie } from "./interfaces/MoviesInterfaces.ts";
import CustomPagination from "./components/CustomPagination.tsx";

const App = () => {
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [hasNextPage, setHasNextPage] = useState(true);

  const handleMovieClick = (movie: IMovie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedMovie(null);
    setIsModalOpen(false);
  };

  // Handler for page change
  const handlePageChange = (page: number) => {
    if (page >= 1) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(
          `/movies?page=${currentPage}&limit=${itemsPerPage}`
        );
        const fetchedMovies = response.data.data;
        setMovies(fetchedMovies);

        // If the fetched data is less than the requested limit, we assume this is the last page.
        setHasNextPage(fetchedMovies.length === itemsPerPage);

        // If we jumped to an empty page (e.g., deleted last item), go back one page.
        if (fetchedMovies.length === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
          setHasNextPage(false); // Definitely no next page if current is empty
        }
      } catch (error) {
        console.error("Error occurred fetching movies: ", error);
        setHasNextPage(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [currentPage]);

  return (
    <div className="w-full max-w-7xl mx-auto text-center flex flex-col gap-4">
      <p className="text-4xl font-bold text-red-500 mt-4">
        Movie Recommendation System
      </p>

      <CustomPagination
        currentPage={currentPage}
        hasNextPage={hasNextPage}
        onPageChange={handlePageChange}
      />

      {isLoading ? (
        <p className="text-xl text-white font-medium">Please wait...</p>
      ) : (
        <GridLayout movies={movies} onMovieClick={handleMovieClick} />
      )}

      {/* RENDER THE MODAL */}
      {selectedMovie && (
        <CustomModal
          isClicked={isModalOpen}
          setIsClicked={handleModalClose}
          movie={selectedMovie}
        />
      )}

      <CustomPagination
        currentPage={currentPage}
        hasNextPage={hasNextPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default App;
