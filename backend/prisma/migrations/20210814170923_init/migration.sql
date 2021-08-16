-- CreateTable
CREATE TABLE "Products" (
    "id" SERIAL NOT NULL,
    "product_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit_type" TEXT NOT NULL,
    "list_price" INTEGER NOT NULL,
    "vat" INTEGER NOT NULL,
    "selling_price" INTEGER NOT NULL,
    "unit_quantity" INTEGER NOT NULL,
    "unavailable" BOOLEAN NOT NULL,
    "available_in_webshop" BOOLEAN NOT NULL,

    PRIMARY KEY ("id")
);
