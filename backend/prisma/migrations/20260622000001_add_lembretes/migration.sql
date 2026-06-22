-- CreateTable
CREATE TABLE "lembretes" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "criadoPor" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lembretes_pkey" PRIMARY KEY ("id")
);
