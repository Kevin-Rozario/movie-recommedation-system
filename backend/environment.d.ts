declare namespace NodeJS {
  interface ProcessEnv {
    // TMDB
    TMDB_BASE_URL: string;
    TMDB_READ_ACCESS_TOKEN: string;

    // Qdrant
    QDRANT_HOST: string;
    QDRANT_PORT: number;
    QDRANT_EMBEDDING_DIMENSION: number;

    // Firebase
    FIREBASE_APP_ID: string;
    FIREBASE_COLLECTION_NAME: string;
    FIREBASE_SERVICE_ACCOUNT_FILE: string;

    // Server
    PORT: number;
    NODE_ENV: string;
    MOVIES_METADATA_FILE: string;
    MOVIES_EMBEDDING_FILE: string;
    POSTER_CACHE_FILE: string;
  }
}
