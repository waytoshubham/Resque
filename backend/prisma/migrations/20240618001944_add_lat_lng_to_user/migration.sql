-- Step 3.1: Create new enum type for status
CREATE TYPE "Status" AS ENUM ('PENDING', 'ACCEPTED', 'DENIED');

-- Step 3.2: Add new columns with default values
ALTER TABLE "Notification" 
ADD COLUMN "Bylat" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN "Bylng" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN "Tolat" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN "Tolng" DOUBLE PRECISION DEFAULT 0.0;

ALTER TABLE "User" 
ADD COLUMN "lat" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN "lng" DOUBLE PRECISION DEFAULT 0.0;

-- Step 3.3: Set default values for existing rows
UPDATE "Notification" SET "Bylat" = 0.0 WHERE "Bylat" IS NULL;
UPDATE "Notification" SET "Bylng" = 0.0 WHERE "Bylng" IS NULL;
UPDATE "Notification" SET "Tolat" = 0.0 WHERE "Tolat" IS NULL;
UPDATE "Notification" SET "Tolng" = 0.0 WHERE "Tolng" IS NULL;

UPDATE "User" SET "lat" = 0.0 WHERE "lat" IS NULL;
UPDATE "User" SET "lng" = 0.0 WHERE "lng" IS NULL;

-- Step 3.4: Alter columns to be NOT NULL
ALTER TABLE "Notification" 
ALTER COLUMN "Bylat" SET NOT NULL,
ALTER COLUMN "Bylng" SET NOT NULL,
ALTER COLUMN "Tolat" SET NOT NULL,
ALTER COLUMN "Tolng" SET NOT NULL;

ALTER TABLE "User" 
ALTER COLUMN "lat" SET NOT NULL,
ALTER COLUMN "lng" SET NOT NULL;

-- Step 3.5: Drop columns that will cause data loss
ALTER TABLE "Notification" 
DROP COLUMN "ambulanceProfileId",
DROP COLUMN "createdAt",
DROP COLUMN "message",
DROP COLUMN "trafficProfileId",
DROP COLUMN "status";

-- Step 3.6: Add new status column
ALTER TABLE "Notification" 
ADD COLUMN "status" "Status" NOT NULL DEFAULT 'PENDING';

-- Step 3.7: Drop old enum type if it exists
DROP TYPE IF EXISTS "NotificationStatus";
