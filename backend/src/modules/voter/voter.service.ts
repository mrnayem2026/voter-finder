// Removed Prisma import due to client version export issues
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import type { CreateVoterInput, SearchVoterQuery, UpdateVoterInput } from "./voter.schema.js";
import { createVoterSchema } from "./voter.schema.js";

export class VoterService {
  /**
   * Create a new voter record
   */
  static async create(data: CreateVoterInput) {
    try {
      return await prisma.voter.create({ data });
    } catch (error: any) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        throw ApiError.conflict(`A voter with this ${target.join(", ")} already exists`);
      }
      throw error;
    }
  }

  /**
   * Search voters with pagination and case-insensitive partial match
   */
  static async search(query: SearchVoterQuery) {
    const { search = "", page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = search
      ? {
          voterName: {
            contains: search,
            mode: "insensitive",
          },
        }
      : {};

    const [voters, total] = await Promise.all([
      prisma.voter.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.voter.count({ where }),
    ]);

    return {
      voters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single voter by ID
   */
  static async getById(id: string) {
    const voter = await prisma.voter.findUnique({ where: { id } });

    if (!voter) {
      throw ApiError.notFound("Voter not found");
    }

    return voter;
  }

  /**
   * Update a voter record
   */
  static async update(id: string, data: UpdateVoterInput) {
    // Verify voter exists
    await VoterService.getById(id);

    try {
      return await prisma.voter.update({
        where: { id },
        data,
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[]) || [];
        throw ApiError.conflict(`A voter with this ${target.join(", ")} already exists`);
      }
      throw error;
    }
  }

  /**
   * Delete a voter record
   */
  static async delete(id: string) {
    await VoterService.getById(id);
    await prisma.voter.delete({ where: { id } });
    return { message: "Voter deleted successfully" };
  }

  /**
   * Export all voters as CSV
   */
  static async exportCsv(): Promise<string> {
    const voters = await prisma.voter.findMany({
      orderBy: { createdAt: "desc" },
    });

    const csvData = stringify(voters, {
      header: true,
      columns: [
        { key: "voterSlipNumber", header: "Voter Slip Number" },
        { key: "voterName", header: "Voter Name" },
        { key: "voterNumber", header: "Voter Number" },
        { key: "fatherName", header: "Father Name" },
        { key: "motherName", header: "Mother Name" },
        { key: "occupation", header: "Occupation" },
        { key: "dateOfBirth", header: "Date of Birth" },
        { key: "address", header: "Address" },
        { key: "createdAt", header: "Created At" },
      ],
    });

    return csvData;
  }

  /**
   * Import voters from CSV buffer
   * - Validates each row
   * - Skips duplicates
   * - Uses transaction for atomicity
   * - Returns detailed report
   */
  static async importCsv(fileBuffer: Buffer) {
    // Parse CSV
    let records: Record<string, string>[];
    try {
      records = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch {
      throw ApiError.badRequest("Invalid CSV file format");
    }

    if (records.length === 0) {
      throw ApiError.badRequest("CSV file is empty");
    }

    const results = {
      total: records.length,
      imported: 0,
      skipped: 0,
      errors: [] as { row: number; reason: string }[],
    };

    // Map CSV column headers to field names (flexible mapping)
    const mapRecord = (record: Record<string, string>) => ({
      voterSlipNumber: record["Voter Slip Number"] || record["voterSlipNumber"] || record["voter_slip_number"] || "",
      voterName: record["Voter Name"] || record["voterName"] || record["voter_name"] || "",
      voterNumber: record["Voter Number"] || record["voterNumber"] || record["voter_number"] || "",
      fatherName: record["Father Name"] || record["fatherName"] || record["father_name"] || "",
      motherName: record["Mother Name"] || record["motherName"] || record["mother_name"] || "",
      occupation: record["Occupation"] || record["occupation"] || "",
      dateOfBirth: record["Date of Birth"] || record["dateOfBirth"] || record["date_of_birth"] || undefined,
      address: record["Address"] || record["address"] || "",
    });

    // Validate and prepare records
    const validRecords: CreateVoterInput[] = [];

    for (let i = 0; i < records.length; i++) {
      const mapped = mapRecord(records[i]);
      const validation = createVoterSchema.safeParse(mapped);

      if (!validation.success) {
        results.errors.push({
          row: i + 2, // +2 for 1-indexed and header row
          reason: validation.error.issues.map((e: any) => `${e.path.join(".")}: ${e.message}`).join("; "),
        });
        results.skipped++;
        continue;
      }

      validRecords.push(validation.data);
    }

    if (validRecords.length === 0) {
      return results;
    }

    // Check for duplicates in DB
    const existingSlips = new Set(
      (
        await prisma.voter.findMany({
          where: {
            voterSlipNumber: {
              in: validRecords.map((r) => r.voterSlipNumber),
            },
          },
          select: { voterSlipNumber: true },
        })
      ).map((v: any) => v.voterSlipNumber),
    );

    const existingNumbers = new Set(
      (
        await prisma.voter.findMany({
          where: {
            voterNumber: {
              in: validRecords.map((r) => r.voterNumber),
            },
          },
          select: { voterNumber: true },
        })
      ).map((v: any) => v.voterNumber),
    );

    // Filter out duplicates
    const newRecords: CreateVoterInput[] = [];

    for (const record of validRecords) {
      if (existingSlips.has(record.voterSlipNumber)) {
        results.skipped++;
        results.errors.push({
          row: validRecords.indexOf(record) + 2,
          reason: `Duplicate voter slip number: ${record.voterSlipNumber}`,
        });
        continue;
      }

      if (existingNumbers.has(record.voterNumber)) {
        results.skipped++;
        results.errors.push({
          row: validRecords.indexOf(record) + 2,
          reason: `Duplicate voter number: ${record.voterNumber}`,
        });
        continue;
      }

      // Track in-batch duplicates
      existingSlips.add(record.voterSlipNumber);
      existingNumbers.add(record.voterNumber);
      newRecords.push(record);
    }

    // Transaction-safe bulk insert
    if (newRecords.length > 0) {
      await prisma.$transaction(newRecords.map((record) => prisma.voter.create({ data: record })));
      results.imported = newRecords.length;
    }

    return results;
  }
}
