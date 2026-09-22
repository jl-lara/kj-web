-- CreateTable
CREATE TABLE "site_settings" (
    "id" UUID NOT NULL,
    "singleton" INTEGER NOT NULL DEFAULT 1,
    "siteName" TEXT NOT NULL DEFAULT 'Karnes en su Jugo',
    "description" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "address" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "tiktok" TEXT,
    "openingHours" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_singleton_key" ON "site_settings"("singleton");
