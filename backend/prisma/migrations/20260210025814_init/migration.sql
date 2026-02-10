-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'END_USER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'END_USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voters" (
    "id" TEXT NOT NULL,
    "voter_slip_number" TEXT NOT NULL,
    "voter_name" TEXT NOT NULL,
    "voter_number" TEXT NOT NULL,
    "father_name" TEXT NOT NULL,
    "mother_name" TEXT NOT NULL,
    "occupation" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "voters_voter_slip_number_key" ON "voters"("voter_slip_number");

-- CreateIndex
CREATE UNIQUE INDEX "voters_voter_number_key" ON "voters"("voter_number");

-- CreateIndex
CREATE INDEX "voters_voter_name_idx" ON "voters"("voter_name");

-- CreateIndex
CREATE INDEX "voters_voter_number_idx" ON "voters"("voter_number");
