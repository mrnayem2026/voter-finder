import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { AuthService } from "./auth.service.js";
import { sendResponse } from "../../utils/api-response.js";

export class AuthController {
    /**
     * POST /api/auth/login
     */
    static async login(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const result = await AuthService.login(req.body);

            sendResponse({
                res,
                statusCode: 200,
                message: "Login successful",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/auth/me
     */
    static async getProfile(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const user = await AuthService.getProfile(req.user!.id);

            sendResponse({
                res,
                message: "Profile retrieved successfully",
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }
}
