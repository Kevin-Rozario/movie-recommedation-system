export interface IMovieMetadata {
  id: number;
  title: string;
  tagline: string | null;
  overview: string;
  posterUrl: string | null;
  runtime: number | null;
  releaseDate: string | null;
  status: string;
  budget: number;
  revenue: number;
  director: string | null;
  cast: string[];
  genres: string[];
  productionCompanies: string[];
  productionCountries: string[];
  spokenLanguages: string[];
}

export interface IMovieEmbedding {
  id: number;
  vector: number[];
  payload: {
    title: string;
    posterUrl: string | null;
    vote_average: number; // Naming bcoz it's a reserved word
  };
}
