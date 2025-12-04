export interface IMovieMetadata {
  id: number;
  title: string;
  tagline: string | null;
  overview: string;
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

export interface IMovie {
  id: number;
  title: string;
  posterUrl: string | null;
  voteAverage: number;
}
