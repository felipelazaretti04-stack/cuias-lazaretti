-- CreateEnum
CREATE TYPE "HomeRailType" AS ENUM ('FEATURED', 'NEW', 'BEST_SELLERS', 'PERSONALIZED', 'READY_TO_SHIP');

-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT,
    "badge" TEXT,
    "title" TEXT,
    "highlight" TEXT,
    "subtitle" TEXT,
    "primaryText" TEXT,
    "primaryHref" TEXT,
    "secondaryText" TEXT,
    "secondaryHref" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeRail" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "hrefAll" TEXT,
    "type" "HomeRailType" NOT NULL DEFAULT 'FEATURED',
    "limit" INTEGER NOT NULL DEFAULT 8,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeRail_pkey" PRIMARY KEY ("id")
);
