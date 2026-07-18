-- AlterTable
ALTER TABLE `Coupon` ADD COLUMN `perCustomerLimit` INTEGER NULL;
ALTER TABLE `Coupon` ADD COLUMN `assignedUserId` INTEGER NULL;

-- CreateTable
CREATE TABLE `CouponRedemption` (
    `id` VARCHAR(191) NOT NULL,
    `couponId` VARCHAR(191) NOT NULL,
    `reservationId` VARCHAR(191) NULL,
    `userId` INTEGER NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerEmail` VARCHAR(191) NOT NULL,
    `subtotal` INTEGER NOT NULL,
    `discountAmount` INTEGER NOT NULL,
    `total` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CouponRedemption_couponId_idx`(`couponId`),
    INDEX `CouponRedemption_reservationId_idx`(`reservationId`),
    INDEX `CouponRedemption_userId_idx`(`userId`),
    INDEX `CouponRedemption_customerEmail_idx`(`customerEmail`),
    INDEX `CouponRedemption_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Coupon_isActive_idx` ON `Coupon`(`isActive`);
CREATE INDEX `Coupon_expiresAt_idx` ON `Coupon`(`expiresAt`);
CREATE INDEX `Coupon_assignedUserId_idx` ON `Coupon`(`assignedUserId`);

-- AddForeignKey
ALTER TABLE `Coupon` ADD CONSTRAINT `Coupon_assignedUserId_fkey` FOREIGN KEY (`assignedUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouponRedemption` ADD CONSTRAINT `CouponRedemption_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `Coupon`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CouponRedemption` ADD CONSTRAINT `CouponRedemption_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
