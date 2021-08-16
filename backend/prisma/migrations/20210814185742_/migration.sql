/*
  Warnings:

  - You are about to drop the `Products` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Products";

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "product_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit_type" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "list_price" INTEGER NOT NULL,
    "vat" INTEGER NOT NULL,
    "selling_price" INTEGER NOT NULL,
    "unit_quantity" INTEGER NOT NULL,
    "unavailable" BOOLEAN NOT NULL,
    "available_in_webshop" BOOLEAN NOT NULL,
    "is_organic" BOOLEAN NOT NULL,
    "is_ecological" BOOLEAN NOT NULL,
    "is_private_label" BOOLEAN NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products.product_id_unique" ON "products"("product_id");
