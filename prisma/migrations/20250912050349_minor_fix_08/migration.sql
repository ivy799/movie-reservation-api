/*
  Warnings:

  - You are about to drop the column `status` on the `Reservation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[movieSeatId]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Reservation" DROP COLUMN "status";

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_movieSeatId_key" ON "public"."Reservation"("movieSeatId");
