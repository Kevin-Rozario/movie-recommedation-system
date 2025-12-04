# Backend - Movie Recommendation System

This directory contains the backend for the Movie Recommendation System. It's a Node.js application built with Express and TypeScript, responsible for serving movie recommendations based on a vector similarity search.

## Architecture

The backend follows a standard MVC-like pattern:

- **Routes**: Define the API endpoints and direct requests to the appropriate controllers.
- **Controllers**: Handle incoming requests, validate inputs, and call the corresponding services.
- **Services**: Contain the core business logic, including interactions with the Qdrant vector database and Firebase for movie metadata.
- **Middlewares**: Provide centralized error handling and other request processing utilities.

## Technologies Used

- **Framework**: Express.js
- **Language**: TypeScript
- **Runtime/Package Manager**: Bun
- **Database**:
  - **Qdrant**: For vector-based movie similarity search.
  - **Firebase (Firestore)**: For storing and retrieving movie metadata.
- **API Testing**: A `api.test.rest` file is included for use with the REST Client extension in VS Code.

## Getting Started

Follow these instructions to set up and run the backend service.

### Prerequisites

- **Bun**: This project uses Bun for package management and as the runtime. Make sure you have it installed from [bun.sh](https://bun.sh/).
- **Firebase Credentials**: You'll need a Firebase service account key to authenticate with Firestore.
- **Qdrant**: A running instance of Qdrant is required.

### Installation and Setup

1. **Navigate to the backend directory**:
   ```sh
   cd backend
   ```

2. **Install dependencies**:
   ```sh
   bun install
   ```

3. **Environment Variables**:
   Create a `.env` file in the `backend` directory and populate it with the following:
   ```env
   # Qdrant Configuration
   QDRANT_HOST=localhost
   QDRANT_PORT=6333

   # Firebase Admin SDK Configuration
   FIREBASE_PROJECT_ID="your-firebase-project-id"
   FIREBASE_CLIENT_EMAIL="your-firebase-client-email"
   FIREBASE_PRIVATE_KEY="your-firebase-private-key"

   # Data files for seeding
   MOVIES_METADATA_FILE=./data/movie_display_metadata_detailed.jsonl
   MOVIES_EMBEDDING_FILE=./data/movies_hybrid_qdrant.jsonl
   ```
   *Note: The `FIREBASE_PRIVATE_KEY` needs to be the base64 encoded version of your service account key.*

4. **Seeding the Databases**:
   The project includes scripts to seed the Qdrant and Firebase databases.

   - **Firebase**: The `seedMoviesFirebase.script.ts` script seeds the Firestore database with movie metadata.
     ```bash
     bun run src/scripts/seedMoviesFirebase.script.ts
     ```
   - **Qdrant**: The `seedMoviesQdrant.script.ts` script seeds the Qdrant database with movie embeddings.
     ```bash
     bun run src/scripts/seedMoviesQdrant.script.ts
     ```

### Running the Server

To start the development server, run:

```bash
bun run src/index.ts
```

The server will start on `http://localhost:3000`.

## API Endpoints

### Get Movie Recommendations

- **GET** `/api/movies/:id/recommendations`

  Retrieves a list of movie recommendations for a given movie ID.

  **Parameters**:
  - `id` (required): The ID of the movie to get recommendations for.
  - `limit` (optional): The number of recommendations to return. Defaults to 10.

  **Example Request**:
  ```bash
  curl http://localhost:3000/api/movies/123/recommendations?limit=5
  ```

  **Example Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 456,
        "title": "Recommended Movie 1",
        "overview": "...",
        "poster_path": "...",
        "genres": ["Action", "Adventure"]
      }
    ]
  }
  ```

## Scripts

The `src/scripts/` directory contains useful scripts for managing the project's data:

- **`fetchPosters.script.ts`**: A script to fetch movie posters from an API and cache them.
- **`seed.script.ts`**: A consolidated script to seed all necessary data into the databases.

## Development Conventions

- The code is written in TypeScript and organized into modules for controllers, services, routes, and middlewares.
- Use `bun` for all package management and script execution.
- Follow the existing coding style and structure when contributing.
- API error handling is centralized in `error.middleware.ts`, and utility functions for consistent API responses are available in the `utils` directory.