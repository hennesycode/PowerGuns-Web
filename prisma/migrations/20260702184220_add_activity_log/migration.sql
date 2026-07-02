-- CreateTable
CREATE TABLE `ActivityLog` (
    `id` VARCHAR(30) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `entityName` VARCHAR(191) NULL,
    `userId` INT NULL,
    `userFullName` VARCHAR(191) NOT NULL,
    `userUsername` VARCHAR(191) NOT NULL,
    `userIdentificationType` VARCHAR(191) NOT NULL,
    `userIdentificationNumber` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'success',
    `errorMessage` TEXT NULL,
    `page` VARCHAR(191) NULL,
    `section` VARCHAR(191) NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ActivityLog_action_idx`(`action`),
    INDEX `ActivityLog_entityType_idx`(`entityType`),
    INDEX `ActivityLog_entityId_idx`(`entityId`),
    INDEX `ActivityLog_userId_idx`(`userId`),
    INDEX `ActivityLog_createdAt_idx`(`createdAt`),
    INDEX `ActivityLog_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
