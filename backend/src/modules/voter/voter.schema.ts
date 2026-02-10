import { z } from "zod";

export const createVoterSchema = z.object({
    voterSlipNumber: z
        .string({ required_error: "Voter slip number is required" })
        .min(1, "Voter slip number is required")
        .trim(),
    voterName: z
        .string({ required_error: "Voter name is required" })
        .min(1, "Voter name is required")
        .trim(),
    voterNumber: z
        .string({ required_error: "Voter number is required" })
        .min(1, "Voter number is required")
        .trim(),
    fatherName: z
        .string({ required_error: "Father name is required" })
        .min(1, "Father name is required")
        .trim(),
    motherName: z
        .string({ required_error: "Mother name is required" })
        .min(1, "Mother name is required")
        .trim(),
    occupation: z.string().trim().optional().default(""),
    dateOfBirth: z
        .string()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined))
        .refine((val) => val === undefined || !isNaN(val.getTime()), {
            message: "Invalid date format",
        }),
    address: z.string().trim().optional().default(""),
});

export const updateVoterSchema = z.object({
    voterSlipNumber: z.string().min(1).trim().optional(),
    voterName: z.string().min(1).trim().optional(),
    voterNumber: z.string().min(1).trim().optional(),
    fatherName: z.string().min(1).trim().optional(),
    motherName: z.string().min(1).trim().optional(),
    occupation: z.string().trim().optional(),
    dateOfBirth: z
        .string()
        .optional()
        .transform((val) => (val ? new Date(val) : undefined))
        .refine((val) => val === undefined || !isNaN(val.getTime()), {
            message: "Invalid date format",
        }),
    address: z.string().trim().optional(),
});

export const searchVoterSchema = z.object({
    search: z.string().optional().default(""),
    page: z
        .string()
        .optional()
        .default("1")
        .transform((val) => Math.max(1, parseInt(val, 10) || 1)),
    limit: z
        .string()
        .optional()
        .default("20")
        .transform((val) => Math.min(100, Math.max(1, parseInt(val, 10) || 20))),
});

export type CreateVoterInput = z.infer<typeof createVoterSchema>;
export type UpdateVoterInput = z.infer<typeof updateVoterSchema>;
export type SearchVoterQuery = z.infer<typeof searchVoterSchema>;
