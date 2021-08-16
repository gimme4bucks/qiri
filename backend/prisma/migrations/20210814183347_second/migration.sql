/*
  Warnings:

  - A unique constraint covering the columns `[product_id]` on the table `Products` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `currency` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_ecological` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_organic` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_private_label` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "is_ecological" BOOLEAN NOT NULL,
ADD COLUMN     "is_organic" BOOLEAN NOT NULL,
ADD COLUMN     "is_private_label" BOOLEAN NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Products.product_id_unique" ON "Products"("product_id");
