-- AlterTable
ALTER TABLE "public"."Account" ADD COLUMN     "refresh_token" TEXT,
ADD COLUMN     "session_state" TEXT;
