import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    (import.meta.env.VITE_BACKEND_URL as string) || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});
