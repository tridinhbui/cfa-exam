/*
  Warnings:

  - The values [PREMIUM_MONTHLY,PREMIUM_YEARLY] on the enum `SubscriptionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `EssayAttempt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EssayQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItemSet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItemSetAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItemSetAttempt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItemSetQuestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AnswerChoice" AS ENUM ('A', 'B', 'C');

-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionType_new" AS ENUM ('FREE', 'PRO');
ALTER TABLE "User" ALTER COLUMN "subscription" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "subscription" TYPE "SubscriptionType_new" USING ("subscription"::text::"SubscriptionType_new");
ALTER TYPE "SubscriptionType" RENAME TO "SubscriptionType_old";
ALTER TYPE "SubscriptionType_new" RENAME TO "SubscriptionType";
DROP TYPE "SubscriptionType_old";
ALTER TABLE "User" ALTER COLUMN "subscription" SET DEFAULT 'FREE';
COMMIT;

-- DropForeignKey
ALTER TABLE "EssayAttempt" DROP CONSTRAINT "EssayAttempt_essayQuestionId_fkey";

-- DropForeignKey
ALTER TABLE "EssayAttempt" DROP CONSTRAINT "EssayAttempt_userId_fkey";

-- DropForeignKey
ALTER TABLE "EssayQuestion" DROP CONSTRAINT "EssayQuestion_topicId_fkey";

-- DropForeignKey
ALTER TABLE "ItemSet" DROP CONSTRAINT "ItemSet_losId_fkey";

-- DropForeignKey
ALTER TABLE "ItemSet" DROP CONSTRAINT "ItemSet_topicId_fkey";

-- DropForeignKey
ALTER TABLE "ItemSetAnswer" DROP CONSTRAINT "ItemSetAnswer_attemptId_fkey";

-- DropForeignKey
ALTER TABLE "ItemSetAnswer" DROP CONSTRAINT "ItemSetAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "ItemSetAttempt" DROP CONSTRAINT "ItemSetAttempt_itemSetId_fkey";

-- DropForeignKey
ALTER TABLE "ItemSetAttempt" DROP CONSTRAINT "ItemSetAttempt_userId_fkey";

-- DropForeignKey
ALTER TABLE "ItemSetQuestion" DROP CONSTRAINT "ItemSetQuestion_itemSetId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastActiveAt" TIMESTAMP(3),
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "password" DROP NOT NULL;

-- DropTable
DROP TABLE "EssayAttempt";

-- DropTable
DROP TABLE "EssayQuestion";

-- DropTable
DROP TABLE "ItemSet";

-- DropTable
DROP TABLE "ItemSetAnswer";

-- DropTable
DROP TABLE "ItemSetAttempt";

-- DropTable
DROP TABLE "ItemSetQuestion";

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "level" "CFALevel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reading" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "pageStart" INTEGER,
    "pageEnd" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "readingId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleQuizHeader" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "ModuleQuizHeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleQuizQuestion" (
    "id" TEXT NOT NULL,
    "headerId" TEXT NOT NULL,
    "questionNo" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "optionC" TEXT NOT NULL,
    "correct" "AnswerChoice" NOT NULL DEFAULT 'B',
    "explanation" TEXT,

    CONSTRAINT "ModuleQuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reading_bookId_idx" ON "Reading"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "Reading_bookId_order_key" ON "Reading"("bookId", "order");

-- CreateIndex
CREATE INDEX "Module_readingId_order_idx" ON "Module"("readingId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Module_readingId_code_key" ON "Module"("readingId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleQuizHeader_moduleId_key" ON "ModuleQuizHeader"("moduleId");

-- CreateIndex
CREATE INDEX "ModuleQuizQuestion_headerId_idx" ON "ModuleQuizQuestion"("headerId");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleQuizQuestion_headerId_questionNo_key" ON "ModuleQuizQuestion"("headerId", "questionNo");

-- CreateIndex
CREATE INDEX "Question_topicId_difficulty_idx" ON "Question"("topicId", "difficulty");

-- AddForeignKey
ALTER TABLE "Reading" ADD CONSTRAINT "Reading_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "Reading"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleQuizHeader" ADD CONSTRAINT "ModuleQuizHeader_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleQuizQuestion" ADD CONSTRAINT "ModuleQuizQuestion_headerId_fkey" FOREIGN KEY ("headerId") REFERENCES "ModuleQuizHeader"("id") ON DELETE CASCADE ON UPDATE CASCADE;
