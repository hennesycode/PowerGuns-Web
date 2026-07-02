-- CreateTable
CREATE TABLE IF NOT EXISTS `Reservation` (
    `id` VARCHAR(191) NOT NULL,
    `reservationCode` VARCHAR(191) NOT NULL,
    `userId` INTEGER NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `identificationType` VARCHAR(191) NOT NULL,
    `identificationNumber` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'Colombia',
    `department` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `reservationDate` DATETIME(3) NOT NULL,
    `reservationTime` VARCHAR(191) NOT NULL,
    `notes` TEXT NULL,
    `status` ENUM('pending', 'in_review', 'confirmed', 'completed') NOT NULL DEFAULT 'pending',
    `subtotal` INTEGER NOT NULL,
    `discount` INTEGER NOT NULL DEFAULT 0,
    `total` INTEGER NOT NULL,
    `couponCode` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Reservation_reservationCode_key`(`reservationCode`),
    INDEX `Reservation_reservationDate_idx`(`reservationDate`),
    INDEX `Reservation_status_idx`(`status`),
    INDEX `Reservation_email_idx`(`email`),
    INDEX `Reservation_identificationNumber_idx`(`identificationNumber`),
    INDEX `Reservation_userId_idx`(`userId`),
    UNIQUE INDEX `Reservation_reservationDate_reservationTime_key`(`reservationDate`, `reservationTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `ReservationItem` (
    `id` VARCHAR(191) NOT NULL,
    `reservationId` VARCHAR(191) NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `serviceTitle` VARCHAR(191) NOT NULL,
    `serviceSlug` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `unitPrice` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `total` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ReservationItem_reservationId_idx`(`reservationId`),
    INDEX `ReservationItem_serviceId_idx`(`serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Reservation` ADD CONSTRAINT `Reservation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReservationItem` ADD CONSTRAINT `ReservationItem_reservationId_fkey` FOREIGN KEY (`reservationId`) REFERENCES `Reservation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
