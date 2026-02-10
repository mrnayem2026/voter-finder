import type { Response } from "express";

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface ApiResponseOptions<T> {
    res: Response;
    statusCode?: number;
    success?: boolean;
    message?: string;
    data?: T;
    pagination?: PaginationMeta;
}

export function sendResponse<T>({
    res,
    statusCode = 200,
    success = true,
    message = "Success",
    data,
    pagination,
}: ApiResponseOptions<T>) {
    const response: Record<string, unknown> = {
        success,
        message,
    };

    if (data !== undefined) {
        response.data = data;
    }

    if (pagination) {
        response.pagination = pagination;
    }

    return res.status(statusCode).json(response);
}
