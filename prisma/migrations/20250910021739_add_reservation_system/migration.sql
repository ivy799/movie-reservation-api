/*
  Warnings:

  - You are about to drop the column `genreId` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `showtimes` on the `Movie` table. All the data in the column will be lost.
  - Added the required column `movieId` to the `Genre` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxShowtime` to the `Movie` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Movie" DROP CONSTRAINT "Movie_genreId_fkey";

-- AlterTable
ALTER TABLE "public"."Genre" ADD COLUMN     "movieId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Movie" DROP COLUMN "genreId",
DROP COLUMN "showtimes",
ADD COLUMN     "maxShowtime" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."MovieShowTime" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "movieShowTime" TIMESTAMP(3) NOT NULL,
    "movieId" TEXT NOT NULL,
    "maxSeat" INTEGER NOT NULL,

    CONSTRAINT "MovieShowTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MovieSeat" (
    "id" TEXT NOT NULL,
    "movieShowTimeId" TEXT NOT NULL,
    "status" INTEGER NOT NULL,

    CONSTRAINT "MovieSeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reservation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "movieSeatId" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "reservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Genre" ADD CONSTRAINT "Genre_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MovieShowTime" ADD CONSTRAINT "MovieShowTime_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MovieSeat" ADD CONSTRAINT "MovieSeat_movieShowTimeId_fkey" FOREIGN KEY ("movieShowTimeId") REFERENCES "public"."MovieShowTime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reservation" ADD CONSTRAINT "Reservation_movieSeatId_fkey" FOREIGN KEY ("movieSeatId") REFERENCES "public"."MovieSeat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
