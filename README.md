
# Movie Recommendation System

This is a full-stack movie recommendation system that allows users to discover new movies based on their interests. The project features a React-based frontend and a Node.js backend, leveraging a powerful vector database for generating personalized recommendations.

## Features

- **Movie Discovery**: Browse a vast collection of movies with detailed information, including posters, genres, and overviews.
- **Personalized Recommendations**: Get movie suggestions tailored to your taste by selecting a movie you like.
- **Interactive UI**: A user-friendly interface with a modern design, built with React and Shadcn UI.
- **Scalable Backend**: The backend is built with Node.js and Express, designed to handle a large number of requests.
- **Vector-Based Search**: Recommendations are powered by Qdrant, a high-performance vector database, ensuring fast and accurate results.

https://github.com/user-attachments/assets/19240742-b9e4-42b1-9128-2c2626011e74

## Technologies Used

- **Frontend**: React, TypeScript, Vite, Shadcn UI, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, Bun
- **Database**: Qdrant (Vector Database), Firebase (Firestore for metadata)
- **API Testing**: REST Client (api.test.rest)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- **Node.js**: Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
- **Bun**: The backend uses Bun as the package manager and runtime. Install it from [bun.sh](https://bun.sh/).
- **Firebase Account**: You will need a Firebase account to store movie metadata. Set up a project at [firebase.google.com](https://firebase.google.com/).

### Installation & Setup

1. **Clone the repository**:
   ```sh
   git clone https://github.com/your-username/movies-recommendation-system.git
   cd movies-recommendation-system
   ```

2. **Backend Setup**:
   - Navigate to the `backend` directory:
     ```sh
     cd backend
     ```
   - Install the dependencies:
     ```sh
     bun install
     ```
   - Set up your environment variables by creating a `.env` file and adding the following:
     ```
     QDRANT_HOST=localhost
     QDRANT_PORT=6333
     FIREBASE_PROJECT_ID=your-firebase-project-id
     FIREBASE_CLIENT_EMAIL=your-firebase-client-email
     FIREBASE_PRIVATE_KEY=your-firebase-private-key
     ```
   - Seed the databases:
     ```sh
     bun run src/scripts/seed.script.ts
     ```
   - Start the backend server:
     ```sh
     bun run src/index.ts
     ```

3. **Frontend Setup**:
   - Navigate to the `frontend` directory:
     ```sh
     cd ../frontend
     ```
   - Install the dependencies:
     ```sh
     pnpm install
     ```
   - Start the frontend development server:
     ```sh
     pnpm run dev
     ```

## Project Structure

The repository is organized into two main folders: `frontend` and `backend`.

- **`frontend/`**: Contains the React application, built with Vite.
  - `src/components/`: Reusable UI components.
  - `src/pages/`: Main pages of the application.
  - `src/App.tsx`: The main component that routes to different pages.
- **`backend/`**: Contains the Node.js server.
  - `src/controllers/`: Request handlers for different API endpoints.
  - `src/services/`: Business logic for interacting with databases.
  - `src/routes/`: API route definitions.
  - `src/scripts/`: Scripts for seeding the database.

## API Endpoints

The backend provides the following API endpoint for fetching movie recommendations:

- **GET** `/api/movies/:id/recommendations?limit={limit}`
  - **Description**: Retrieves a list of movie recommendations for a given movie ID.
  - **Parameters**:
    - `id` (required): The ID of the movie to get recommendations for.
    - `limit` (optional): The number of recommendations to return (defaults to 10).
  - **Example**:
    ```bash
    curl http://localhost:3000/api/movies/123/recommendations?limit=5
    ```

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
