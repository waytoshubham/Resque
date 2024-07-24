-- AlterTable
ALTER TABLE "TrafficNotification" ADD COLUMN     "trafficProfileId" INTEGER;

-- AddForeignKey
ALTER TABLE "TrafficNotification" ADD CONSTRAINT "TrafficNotification_trafficProfileId_fkey" FOREIGN KEY ("trafficProfileId") REFERENCES "TrafficProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
