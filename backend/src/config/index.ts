import dotenv from "dotenv";
dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || "4000", 10),
    jwtSecret: process.env.JWT_SECRET || "fallback-secret-change-me",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
    databaseUrl: process.env.DATABASE_URL || "",
} as const;
