import { z } from "zod";

export const voterSchema = z.object({
  id: z.string(),
  voterSlipNumber: z.string(),
  voterName: z.string(),
  voterNumber: z.string(),
  fatherName: z.string(),
  motherName: z.string(),
  occupation: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
