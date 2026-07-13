-- AlterEnum
ALTER TABLE `PaymentMethod` MODIFY `type` ENUM('bank_transfer', 'cash') NOT NULL DEFAULT 'bank_transfer';
ALTER TABLE `PaymentMethod` MODIFY `provider` ENUM('cash', 'daviplata', 'nequi', 'bancolombia', 'davivienda', 'bbva') NOT NULL;

-- AlterTable
ALTER TABLE `Reservation` ADD COLUMN `paymentMethodLabel` VARCHAR(191) NULL;
