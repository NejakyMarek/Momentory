-- CreateTable
CREATE TABLE "public"."projects" (
    "id" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "pages" INTEGER NOT NULL,
    "photos" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);
