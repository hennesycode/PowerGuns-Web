-- AlterTable
ALTER TABLE `Reservation` ADD COLUMN `durationMinutes` INTEGER NOT NULL DEFAULT 60;

-- AlterTable
ALTER TABLE `ReservationItem` ADD COLUMN `durationMinutes` INTEGER NOT NULL DEFAULT 60;

-- Preserve existing reservations created before minute-based scheduling.
UPDATE `Reservation` SET `durationMinutes` = GREATEST(60, `durationHours` * 60);
UPDATE `ReservationItem` SET `durationMinutes` = GREATEST(60, `hours` * 60);
