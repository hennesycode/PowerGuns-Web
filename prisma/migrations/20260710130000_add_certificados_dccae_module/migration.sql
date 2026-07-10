-- CreateTable
CREATE TABLE `CertificateDccaeItem` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('folder', 'file') NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `fileUrl` VARCHAR(191) NULL,
    `fileKey` VARCHAR(191) NULL,
    `mimeType` VARCHAR(191) NULL,
    `size` INTEGER NULL,
    `extension` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `CertificateDccaeItem_parentId_idx` ON `CertificateDccaeItem`(`parentId`);

-- CreateIndex
CREATE INDEX `CertificateDccaeItem_type_idx` ON `CertificateDccaeItem`(`type`);

-- CreateIndex
CREATE INDEX `CertificateDccaeItem_name_idx` ON `CertificateDccaeItem`(`name`);

-- AddForeignKey
ALTER TABLE `CertificateDccaeItem` ADD CONSTRAINT `CertificateDccaeItem_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `CertificateDccaeItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
