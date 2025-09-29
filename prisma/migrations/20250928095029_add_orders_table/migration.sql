-- CreateTable
CREATE TABLE "public"."orders" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL,
    "amountTotal" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_stripeSessionId_key" ON "public"."orders"("stripeSessionId");

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
