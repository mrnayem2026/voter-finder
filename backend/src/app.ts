import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/auth.routes.js";
import voterRoutes from "./modules/voter/voter.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// ─── Security & Parsing ──────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({
        success: true,
        message: "Voter Management API is running",
        timestamp: new Date().toISOString(),
    });
});

// ─── API Routes ───────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/voters", voterRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// ─── Global Error Handler ─────────────────────────────────────────────
app.use(errorHandler);

export default app;
