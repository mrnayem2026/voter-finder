import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
import { config } from "../../config/index.js";
import { ApiError } from "../../utils/api-error.js";
import type { LoginInput } from "./auth.schema.js";

export class AuthService {
    /**
     * Authenticate user with email and password, return JWT token
     */
    static async login(input: LoginInput) {
        const { email, password } = input;

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw ApiError.unauthorized("Invalid email or password");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw ApiError.unauthorized("Invalid email or password");
        }

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
            },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn as string }
        );

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
    }

    /**
     * Get user profile by ID
     */
    static async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw ApiError.notFound("User not found");
        }

        return user;
    }
}
