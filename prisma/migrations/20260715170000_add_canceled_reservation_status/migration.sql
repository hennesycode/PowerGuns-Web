ALTER TABLE `Reservation` MODIFY `status` ENUM('pending', 'in_review', 'confirmed', 'completed', 'canceled') NOT NULL DEFAULT 'pending';
