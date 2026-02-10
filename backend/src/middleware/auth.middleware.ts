import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import type { Role } from "@prisma/client";

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: Role;
    };
}

/**
 * Middleware: Verify JWT token and attach user to request
 */
export async function authenticate(
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw ApiError.unauthorized("Access token is required");
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw ApiError.unauthorized("Access token is required");
        }

        const decoded = jwt.verify(token, config.jwtSecret) as {
            userId: string;
            email: string;
            role: Role;
        };

        // Verify user still exists in database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true },
        });

        if (!user) {
            throw ApiError.unauthorized("User no longer exists");
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof ApiError) {
            next(error);
        } else if (error instanceof jwt.JsonWebTokenError) {
            next(ApiError.unauthorized("Invalid or expired token"));
        } else {
            next(ApiError.unauthorized("Authentication failed"));
        }
    }
}

/**
 * Middleware: Authorize specific roles
 */
export function authorize(...allowedRoles: Role[]) {
    return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            return next(ApiError.unauthorized("Authentication required"));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                ApiError.forbidden("You do not have permission to perform this action")
            );
        }

        next();
    };
}
