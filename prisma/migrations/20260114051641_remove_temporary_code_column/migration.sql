/*
  Warnings:

  - Removed temporaryCode column from pickers table

*/
-- DropIndex (if exists)
DROP INDEX IF EXISTS "pickers_temporaryCode_key";

-- AlterTable
ALTER TABLE "pickers" 
DROP COLUMN IF EXISTS "temporaryCode",
ADD COLUMN IF NOT EXISTS "codeExpiresAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "temporaryPassword" TEXT,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
