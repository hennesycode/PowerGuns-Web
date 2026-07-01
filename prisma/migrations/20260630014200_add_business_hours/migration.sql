-- CreateTable
CREATE TABLE `BusinessHour` (
    `id` VARCHAR(191) NOT NULL,
    `dayOfWeek` INTEGER NOT NULL,
    `dayName` VARCHAR(191) NOT NULL,
    `isOpen` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BusinessHour_dayOfWeek_key`(`dayOfWeek`),
    INDEX `BusinessHour_dayOfWeek_idx`(`dayOfWeek`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BusinessHourSlot` (
    `id` VARCHAR(191) NOT NULL,
    `businessHourId` VARCHAR(191) NOT NULL,
    `openTime` VARCHAR(191) NOT NULL,
    `closeTime` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `BusinessHourSlot_businessHourId_idx`(`businessHourId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BusinessHourSlot` ADD CONSTRAINT `BusinessHourSlot_businessHourId_fkey` FOREIGN KEY (`businessHourId`) REFERENCES `BusinessHour`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
