import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Seeding database...\n");

    const saltRounds = 12;

    // Seed Super Admin
    const superAdminPassword = await bcrypt.hash("spAdminNayem2026", saltRounds);
    const superAdmin = await prisma.user.upsert({
        where: { email: "superadmin@email.com" },
        update: {},
        create: {
            email: "superadmin@email.com",
            password: superAdminPassword,
            role: Role.SUPER_ADMIN,
        },
    });
    console.log(`✅ Super Admin created: ${superAdmin.email} (${superAdmin.role})`);

    // Seed End User
    const endUserPassword = await bcrypt.hash("user2026", saltRounds);
    const endUser = await prisma.user.upsert({
        where: { email: "user@email.com" },
        update: {},
        create: {
            email: "user@email.com",
            password: endUserPassword,
            role: Role.END_USER,
        },
    });
    console.log(`✅ End User created: ${endUser.email} (${endUser.role})`);

    console.log("\n🎉 Seeding complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
