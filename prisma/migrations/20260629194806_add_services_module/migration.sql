-- CreateTable
CREATE TABLE `TrainingService` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `mainImageUrl` VARCHAR(191) NOT NULL,
    `mainImageKey` VARCHAR(191) NOT NULL,
    `shortDescription` VARCHAR(191) NOT NULL,
    `longDescription` TEXT NOT NULL,
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` VARCHAR(191) NULL,
    `seoKeywords` VARCHAR(191) NULL,
    `tags` VARCHAR(191) NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `discountType` ENUM('none', 'percentage', 'fixed') NOT NULL DEFAULT 'none',
    `discountValue` DECIMAL(10, 2) NULL,
    `finalPrice` DECIMAL(10, 2) NOT NULL,
    `durationMinutes` INTEGER NOT NULL,
    `includes` TEXT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TrainingService_slug_key`(`slug`),
    INDEX `TrainingService_slug_idx`(`slug`),
    INDEX `TrainingService_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrainingServiceImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `serviceId` INTEGER NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `imageKey` VARCHAR(191) NOT NULL,
    `altText` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TrainingServiceImage_serviceId_idx`(`serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TrainingServiceImage` ADD CONSTRAINT `TrainingServiceImage_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `TrainingService`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
