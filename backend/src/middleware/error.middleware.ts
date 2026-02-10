import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/api-error.js";

/**
 * Global error handler middleware
 */
export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }

    // Log unexpected errors
    console.error("❌ Unexpected Error:", err);

    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
}
