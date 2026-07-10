-- AlterTable
ALTER TABLE `InventoryCategory` ADD COLUMN `parentId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `InventoryCategory_parentId_idx` ON `InventoryCategory`(`parentId`);

-- AddForeignKey
ALTER TABLE `InventoryCategory` ADD CONSTRAINT `InventoryCategory_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `InventoryCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
