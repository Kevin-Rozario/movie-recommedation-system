import * as admin from "firebase-admin";
import * as fs from "node:fs";
import * as path from "node:path";
import { ApiError } from "../utils/apiError.util.js";
import type { Firestore, WriteBatch } from "firebase-admin/firestore";
import type { IMovieMetadata } from "../interfaces/movie.interface.js";

const serviceAccountFile = process.env.FIREBASE_SERVICE_ACCOUNT_FILE || "";
const collectionName = process.env.FIREBASE_COLLECTION_NAME || "movie_metadata";

let adminModule: typeof admin = admin;

export class FirebaseAdminService {
  private db: Firestore;
  private batch: WriteBatch;
  private appId: string;

  constructor() {
    this.appId = process.env.FIREBASE_APP_ID || "";
    this.initializeFirebase();
    this.db = adminModule.firestore();
    this.batch = this.startBatch();
  }

  // Initialize Firebase
  private initializeFirebase = () => {
    try {
      if (!fs.existsSync(serviceAccountFile)) {
        throw new Error(
          `Service account file '${serviceAccountFile}' not found. Seeding cannot proceed.`
        );
      }

      if (
        typeof (admin as any).default === "object" &&
        (admin as any).default !== null
      ) {
        adminModule = (admin as any).default;
      } else {
        adminModule = admin;
      }

      const serviceAccount = require(path.resolve(serviceAccountFile));

      if (adminModule.apps.length === 0) {
        adminModule.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase Admin SDK initialized successfully.");
      }
    } catch (error) {
      console.error(
        "Error initializing Firebase Admin SDK. Check serviceAccountKey.json and environment vars.",
        error
      );
      throw new ApiError(500, "Failed to initialize Firebase Admin SDK.");
    }
  };

  // Get Collection Path
  private getCollectionPath(): string {
    return `artifacts/${this.appId}/${collectionName}`;
  }

  // Clean Object for Firestore
  private cleanObjectForFirestore(obj: any): any {
    if (typeof obj !== "object" || obj === null) return obj;

    if (Array.isArray(obj)) {
      return obj
        .map(this.cleanObjectForFirestore.bind(this))
        .filter((item) => item !== undefined);
    }

    const cleaned: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const cleanedValue = this.cleanObjectForFirestore(obj[key]);

        // Skip the key if the value is undefined (Firestore requirement)
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
    }
    return cleaned;
  }

  // Start Batch
  public startBatch(): admin.firestore.WriteBatch {
    return this.db.batch();
  }

  // Add Movie to Batch
  public async addMovieToBatch(movie: IMovieMetadata) {
    try {
      const cleanedMovie = this.cleanObjectForFirestore(movie);

      // Set Document ID to the movie's ID
      const docRef = this.db
        .collection(this.getCollectionPath())
        .doc(String(movie.id));

      this.batch.set(docRef, cleanedMovie);
    } catch (error) {
      console.error("Error adding movie to batch...", error);
      throw new ApiError(500, "Failed to add movie to batch");
    }
  }

  // Commit Batch
  public async commitBatch(): Promise<void> {
    try {
      await this.batch.commit();
      // After commit, reset the batch for the next set of writes
      this.batch = this.startBatch();
      console.log("Batch committed successfully.");
    } catch (error) {
      console.error("Error committing batch:", error);
      throw new ApiError(500, "Failed to commit batch to Firestore.");
    }
  }

  // Get Movie by ID
  public async getMovieById(movieId: number): Promise<IMovieMetadata | null> {
    try {
      if (!movieId) {
        throw new ApiError(400, "Movie ID is required");
      }

      const docRef = this.db.collection(this.getCollectionPath()).doc(String(movieId));
      const doc = await docRef.get();

      if (!doc.exists) {
        console.warn(`No movie found in Firebase with ID: ${movieId}`);
        return null;
      }

      return doc.data() as IMovieMetadata;
    } catch (error) {
      console.error(`Error fetching movie ${movieId} from Firebase:`, error);
      throw new ApiError(500, "Failed to fetch movie details from Firebase.");
    }
  }
}

export const firebaseAdminService = new FirebaseAdminService();
