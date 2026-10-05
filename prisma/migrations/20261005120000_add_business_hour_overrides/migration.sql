CREATE TABLE `BusinessHourOverride` (
    `id` VARCHAR(191) NOT NULL,
    `dateKey` VARCHAR(10) NOT NULL,
    `isOpen` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `reason` VARCHAR(500) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `BusinessHourOverride_dateKey_key`(`dateKey`),
    INDEX `BusinessHourOverride_dateKey_isActive_idx`(`dateKey`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `BusinessHourOverrideSlot` (
    `id` VARCHAR(191) NOT NULL,
    `overrideId` VARCHAR(191) NOT NULL,
    `openTime` VARCHAR(5) NOT NULL,
    `closeTime` VARCHAR(5) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    INDEX `BusinessHourOverrideSlot_overrideId_idx`(`overrideId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `BusinessHourOverrideHistory` (
    `id` VARCHAR(191) NOT NULL,
    `overrideId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(20) NOT NULL,
    `reason` VARCHAR(500) NOT NULL,
    `isOpen` BOOLEAN NOT NULL,
    `slotsJson` TEXT NOT NULL,
    `changedBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `BusinessHourOverrideHistory_overrideId_createdAt_idx`(`overrideId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `BusinessHourOverrideSlot` ADD CONSTRAINT `BusinessHourOverrideSlot_overrideId_fkey` FOREIGN KEY (`overrideId`) REFERENCES `BusinessHourOverride`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `BusinessHourOverrideHistory` ADD CONSTRAINT `BusinessHourOverrideHistory_overrideId_fkey` FOREIGN KEY (`overrideId`) REFERENCES `BusinessHourOverride`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
