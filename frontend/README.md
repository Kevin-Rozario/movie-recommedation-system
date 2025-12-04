# Frontend - Movie Recommendation System

This directory contains the frontend for the Movie Recommendation System, a React application built with Vite that provides a user-friendly interface for discovering and getting movie recommendations.

## Features

- **Movie Grid**: Displays a list of movies in a responsive grid layout.
- **Movie Card**: Shows movie details, including the poster, title, and genres.
- **Recommendation Modal**: Opens a modal to display recommended movies based on a selected movie.
- **Pagination**: Allows users to navigate through the list of movies.
- **Modern UI**: Built with Shadcn UI and Tailwind CSS for a clean and modern look.

## Technologies Used

- **Framework/Library**: React
- **Build Tool**: Vite
- **Language**: TypeScript
- **UI Components**: Shadcn UI
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Package Manager**: pnpm

## Getting Started

Follow these instructions to set up and run the frontend application.

### Prerequisites

- **Node.js**: Make sure you have Node.js installed.
- **pnpm**: This project uses pnpm as the package manager. You can install it with `npm install -g pnpm`.

### Installation and Setup

1. **Navigate to the frontend directory**:
   ```sh
   cd frontend
   ```

2. **Install dependencies**:
   ```sh
   pnpm install
   ```

3. **Environment Variables**:
   Create a `.env.local` file in the `frontend` directory and add the following environment variable to specify the backend API URL:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```
   This URL should point to the running backend service.

### Running the Development Server

To start the development server, run:

```bash
pnpm run dev
```

The application will be available at `http://localhost:5173`.

## Project Structure

The frontend code is organized into the following directories:

- **`src/components/`**: Contains reusable UI components.
  - **`ui/`**: Auto-generated components from Shadcn UI.
  - **`CustomModal.tsx`**: A custom modal component for displaying recommendations.
  - **`MovieCard.tsx`**: The component for displaying a single movie.
  - **`GridLayout.tsx`**: A layout component for the movie grid.
- **`src/config/`**: Configuration files, such as `axios.config.ts` for setting up Axios.
- **`src/interfaces/`**: TypeScript interfaces for data structures like movies.
- **`src/lib/`**: Utility functions.
- **`src/App.tsx`**: The main application component that sets up the layout and routing.
- **`src/main.tsx`**: The entry point of the application.

## Components Overview

- **`MovieCard`**: A card that displays the movie's poster, title, and genres. Clicking on the card will trigger the recommendation modal.
- **`GridLayout`**: A responsive grid that organizes the `MovieCard` components.
- **`CustomPagination`**: A pagination component to navigate through pages of movies.
- **`RecommendedMovies`**: A component that fetches and displays recommended movies inside the `CustomModal`.
- **`CustomModal`**: A modal that displays the `RecommendedMovies` component when a movie is selected.

## Development Conventions

- The project uses `pnpm` for package management.
- Components are built using a combination of custom components and components from the Shadcn UI library.
- API requests are managed through a pre-configured Axios instance in `src/config/axios.config.ts`.
- TypeScript is used for type safety across the application.
- Follow the existing code style and file organization when contributing.