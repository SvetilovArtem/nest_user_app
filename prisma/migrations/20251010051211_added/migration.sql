/*
  Warnings:

  - You are about to drop the column `is2faEnabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otpSecret` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "is2faEnabled",
DROP COLUMN "otpSecret";

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "is2faEnabled" BOOLEAN NOT NULL DEFAULT false,
    "otpChannel" VARCHAR(20),

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
