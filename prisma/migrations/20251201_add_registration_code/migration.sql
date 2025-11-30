-- CreateTable
CREATE TABLE "RegistrationCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationCode_code_key" ON "RegistrationCode"("code");

-- Set primary key
ALTER TABLE "RegistrationCode" ADD CONSTRAINT "RegistrationCode_pkey" PRIMARY KEY ("id");
