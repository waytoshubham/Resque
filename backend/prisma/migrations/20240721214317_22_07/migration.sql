-- CreateTable
CREATE TABLE "TrafficNotification" (
    "id" SERIAL NOT NULL,
    "area" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrafficNotification_pkey" PRIMARY KEY ("id")
);
