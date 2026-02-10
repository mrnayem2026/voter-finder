import type { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils/api-error.js";

/**
 * Middleware: Validate request body, query, or params using a Zod schema
 */
export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            const parsed = schema.parse(req[source]);

            // Reassign or mutate the source object
            if (source === "body") {
                req.body = parsed;
            } else {
                // For query/params, mutate the object AND try to reassign/defineProperty
                const target = req[source] as any;

                // 1. Try to mutate directly (if target is a plain object)
                try {
                    for (const key in target) delete target[key];
                    Object.assign(target, parsed);
                } catch (e) { /* ignore */ }

                // 2. Try to redefine the property on the request object itself
                // This overrides getters defined on the prototype
                try {
                    Object.defineProperty(req, source, {
                        value: parsed,
                        writable: true,
                        configurable: true,
                        enumerable: true
                    });
                } catch (e) { /* ignore */ }
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const messages = error.issues.map(
                    (e: any) => `${e.path.join(".")}: ${e.message}`
                );
                next(ApiError.badRequest(`Validation failed: ${messages.join(", ")}`));
            } else {
                next(error);
            }
        }
    };
}
