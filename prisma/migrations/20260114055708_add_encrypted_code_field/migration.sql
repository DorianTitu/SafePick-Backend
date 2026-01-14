-- AlterTable
ALTER TABLE "pickers" ADD COLUMN     "encryptedCode" TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT;
