// ============================================================
// GigFlow — Server Entry Point
// Initializes Express, connects to MongoDB Atlas, configures
// CORS for split deployment (Backend: Render, Frontend: Vercel),
// mounts all routes, and starts the server.
// ============================================================

import express, { Application, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Route imports
import authRoutes from "./routes/authRoutes";
import leadRoutes from "./routes/leadRoutes";
import csvRoutes from "./routes/csvRoutes";

// Middleware imports
import errorHandler from "./middleware/errorMiddleware";

// ---- Load Environment Variables ----

dotenv.config();

// ---- Initialize Express ----

const app: Application = express();

// ---- CORS Configuration ----
// FRONTEND_URL must be set in production (e.g., https://gigflow.vercel.app)
// In development, falls back to localhost:5173 (Vite default)

const allowedOrigins: string[] = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((origin: string): string => origin.trim())
  : ["http://localhost:5173"];

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ): void => {
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} is not allowed by CORS policy.`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// ---- Body Parser ----

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Health Check Route ----

app.get("/api/health", (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: "GigFlow API is running.",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ---- Mount Routes ----

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/csv", csvRoutes);

// ---- 404 Handler for Unmatched Routes ----

app.use((_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: "The requested endpoint does not exist.",
  });
});

// ---- Centralized Error Handler (must be last) ----

app.use(errorHandler);

// ---- Database Connection & Server Start ----

const PORT: number = parseInt(process.env.PORT || "5001", 10);
const MONGO_URI: string = process.env.MONGO_URI || "";

const startServer = async (): Promise<void> => {
  try {
    if (!MONGO_URI) {
      console.error("[GigFlow] MONGO_URI is not defined in environment variables.");
      process.exit(1);
    }

    console.log("[GigFlow] Connecting to MongoDB Atlas...");

    await mongoose.connect(MONGO_URI);

    console.log("[GigFlow] MongoDB Atlas connected successfully.");

    app.listen(PORT, (): void => {
      console.log(`[GigFlow] Server is running on port ${PORT}`);
      console.log(`[GigFlow] Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`[GigFlow] Allowed Origins: ${allowedOrigins.join(", ")}`);
    });
  } catch (error: unknown) {
    const errorMessage: string =
      error instanceof Error ? error.message : "Unknown database connection error.";
    console.error(`[GigFlow] Failed to start server: ${errorMessage}`);
    process.exit(1);
  }
};

// ---- Graceful Shutdown ----

process.on("SIGINT", async (): Promise<void> => {
  console.log("\n[GigFlow] Received SIGINT. Shutting down gracefully...");
  await mongoose.connection.close();
  console.log("[GigFlow] MongoDB connection closed.");
  process.exit(0);
});

process.on("SIGTERM", async (): Promise<void> => {
  console.log("\n[GigFlow] Received SIGTERM. Shutting down gracefully...");
  await mongoose.connection.close();
  console.log("[GigFlow] MongoDB connection closed.");
  process.exit(0);
});

startServer();

export default app;
