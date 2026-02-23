-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('PERCENTAGE', 'FIXED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "couponCode" TEXT,
ADD COLUMN     "discountCents" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SiteContent" (
    "id" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL DEFAULT 'A cuia certa pro teu mate.',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Cuias premium, bombas e acessórios com estética clean. Envio Brasil + retirada em Erechim/RS.',
    "heroBadgeText" TEXT NOT NULL DEFAULT 'Artesanal Premium • Sul do Brasil',
    "heroPrimaryButtonText" TEXT NOT NULL DEFAULT 'Comprar agora',
    "heroPrimaryButtonLink" TEXT NOT NULL DEFAULT '/produtos',
    "heroSecondaryButtonText" TEXT NOT NULL DEFAULT 'Ver cuias',
    "heroSecondaryButtonLink" TEXT NOT NULL DEFAULT '/produtos?cat=cuias',
    "heroImageUrl" TEXT,
    "institutionalTitle" TEXT NOT NULL DEFAULT 'Personalização que faz sentido',
    "institutionalText" TEXT NOT NULL DEFAULT 'Escolha a variação personalizável e descreva no checkout. Prazo de produção aparece na página do produto.',
    "institutionalImageUrl" TEXT,
    "scarcityText" TEXT NOT NULL DEFAULT 'Produção artesanal — prazo médio 3 dias',
    "trustBarJson" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'CLOUDINARY',
    "width" INTEGER,
    "height" INTEGER,
    "bytes" INTEGER,
    "format" TEXT,
    "alt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "name" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CouponType" NOT NULL,
    "value" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "maxUses" INTEGER,
    "usesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- CreateIndex
CREATE INDEX "Review_approved_idx" ON "Review"("approved");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
