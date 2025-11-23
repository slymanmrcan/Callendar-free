-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "platform" TEXT,
ADD COLUMN     "speaker" TEXT;
