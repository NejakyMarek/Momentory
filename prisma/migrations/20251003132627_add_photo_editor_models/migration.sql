/*
  Warnings:

  - You are about to drop the column `pages` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `photos` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `variant` on the `projects` table. All the data in the column will be lost.
  - The `status` column on the `projects` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `pageCount` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceCents` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantId` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('editing', 'ready', 'ordered', 'paid');

-- AlterTable
ALTER TABLE "public"."projects" DROP COLUMN "pages",
DROP COLUMN "photos",
DROP COLUMN "variant",
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'usd',
ADD COLUMN     "pageCount" INTEGER NOT NULL,
ADD COLUMN     "pagesJson" JSONB,
ADD COLUMN     "priceCents" INTEGER NOT NULL,
ADD COLUMN     "size" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "variantId" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."ProjectStatus" NOT NULL DEFAULT 'editing';

-- CreateTable
CREATE TABLE "public"."assets" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "exif" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."assets" ADD CONSTRAINT "assets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
