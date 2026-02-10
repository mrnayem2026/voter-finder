import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { VoterService } from "./voter.service.js";
import { sendResponse } from "../../utils/api-response.js";

export class VoterController {
    /**
     * POST /api/voters – Create a voter
     */
    static async create(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const voter = await VoterService.create(req.body);

            sendResponse({
                res,
                statusCode: 201,
                message: "Voter created successfully",
                data: voter,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/voters – Search/list voters with pagination
     */
    static async search(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { voters, pagination } = await VoterService.search(req.query as any);

            sendResponse({
                res,
                message: "Voters retrieved successfully",
                data: voters,
                pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/voters/:id – Get voter by ID
     */
    static async getById(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const voter = await VoterService.getById(req.params.id);

            sendResponse({
                res,
                message: "Voter retrieved successfully",
                data: voter,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/voters/:id – Update voter
     */
    static async update(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const voter = await VoterService.update(req.params.id, req.body);

            sendResponse({
                res,
                message: "Voter updated successfully",
                data: voter,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/voters/:id – Delete voter
     */
    static async delete(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const result = await VoterService.delete(req.params.id);

            sendResponse({
                res,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/voters/export/csv – Export all voters as CSV
     */
    static async exportCsv(
        _req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const csv = await VoterService.exportCsv();

            res.setHeader("Content-Type", "text/csv");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename=voters_export_${Date.now()}.csv`
            );
            res.send(csv);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/voters/import/csv – Import voters from CSV file
     */
    static async importCsv(
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({
                    success: false,
                    message: "CSV file is required. Upload with field name 'file'.",
                });
                return;
            }

            const results = await VoterService.importCsv(req.file.buffer);

            sendResponse({
                res,
                statusCode: 200,
                message: `Import complete: ${results.imported} imported, ${results.skipped} skipped out of ${results.total} rows`,
                data: results,
            });
        } catch (error) {
            next(error);
        }
    }
}
