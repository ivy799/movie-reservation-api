/*
  Warnings:

  - You are about to drop the column `movieShowTimeId` on the `MovieSeat` table. All the data in the column will be lost.
  - You are about to drop the `MovieShowTime` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `movieShowHourId` to the `MovieSeat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."MovieSeat" DROP CONSTRAINT "MovieSeat_movieShowTimeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MovieShowTime" DROP CONSTRAINT "MovieShowTime_movieId_fkey";

-- AlterTable
ALTER TABLE "public"."Movie" ADD COLUMN     "price" INTEGER;

-- AlterTable
ALTER TABLE "public"."MovieSeat" DROP COLUMN "movieShowTimeId",
ADD COLUMN     "movieShowHourId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."MovieShowTime";

-- CreateTable
CREATE TABLE "public"."MovieShowDate" (
    "id" TEXT NOT NULL,
    "movieShowDate" TIMESTAMP(3) NOT NULL,
    "movieId" TEXT NOT NULL,

    CONSTRAINT "MovieShowDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MovieShowHour" (
    "id" TEXT NOT NULL,
    "movieShowDateId" TEXT NOT NULL,
    "movieShowHour" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovieShowHour_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."MovieShowDate" ADD CONSTRAINT "MovieShowDate_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MovieShowHour" ADD CONSTRAINT "MovieShowHour_movieShowDateId_fkey" FOREIGN KEY ("movieShowDateId") REFERENCES "public"."MovieShowDate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MovieSeat" ADD CONSTRAINT "MovieSeat_movieShowHourId_fkey" FOREIGN KEY ("movieShowHourId") REFERENCES "public"."MovieShowHour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
