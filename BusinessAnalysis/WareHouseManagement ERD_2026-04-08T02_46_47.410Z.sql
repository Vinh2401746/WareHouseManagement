CREATE TABLE IF NOT EXISTS `branches` (
	`id` VARCHAR NOT NULL UNIQUE COMMENT 'ObjectId',
	`name` VARCHAR NOT NULL,
	`address` VARCHAR,
	`phone` VARCHAR,
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	PRIMARY KEY(`id`)
) COMMENT='Chi nhánh';


CREATE TABLE IF NOT EXISTS `warehouses` (
	`id` VARCHAR NOT NULL UNIQUE COMMENT 'ObjectId',
	`name` VARCHAR NOT NULL,
	`branch_id` VARCHAR NOT NULL COMMENT 'FK → branches',
	`address` VARCHAR,
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	PRIMARY KEY(`id`)
) COMMENT='Kho hàng';


CREATE TABLE IF NOT EXISTS `units` (
	`id` VARCHAR NOT NULL UNIQUE COMMENT 'ObjectId',
	`code` VARCHAR NOT NULL,
	`name` VARCHAR NOT NULL,
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	PRIMARY KEY(`id`)
) COMMENT='Đơn vị tính';


CREATE UNIQUE INDEX `units_code_unique`
ON `units` (`code`);
CREATE TABLE IF NOT EXISTS `permissions` (
	`id` VARCHAR NOT NULL UNIQUE COMMENT 'ObjectId',
	`code` VARCHAR NOT NULL,
	`name` VARCHAR NOT NULL,
	`group` VARCHAR,
	`description` TEXT,
	`is_system` BOOLEAN DEFAULT true,
	`created_by` VARCHAR COMMENT 'FK → users',
	`updated_by` VARCHAR COMMENT 'FK → users',
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	PRIMARY KEY(`id`)
) COMMENT='Quyền hệ thống';


CREATE UNIQUE INDEX `permissions_code_unique`
ON `permissions` (`code`);
CREATE TABLE IF NOT EXISTS `roles` (
	`id` VARCHAR NOT NULL UNIQUE COMMENT 'ObjectId',
	`name` VARCHAR NOT NULL,
	`key` VARCHAR NOT NULL,
	`description` TEXT,
	`scope` ENUM('branch', 'global') DEFAULT 'branch' COMMENT 'branch | global',
	`permissions_json` TEXT COMMENT 'Biểu diễn mảng permissions[] để trực quan hóa trong drawDB',
	`is_system` BOOLEAN DEFAULT true,
	`is_immutable` BOOLEAN DEFAULT false,
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	PRIMARY KEY(`id`)
) COMMENT='Vai trò. Quan hệ permissions[] đang là mảng ObjectId embedded trong MongoDB.';


CREATE UNIQUE INDEX `roles_key_unique`
ON `roles` (`key`);
CREATE TABLE IF NOT EXISTS `users` (
	`id` VARCHAR NOT NULL UNIQUE COMMENT 'ObjectId',
	`name` VARCHAR NOT NULL,
	`email` VARCHAR NOT NULL,
	`password` VARCHAR NOT NULL COMMENT 'bcrypt hash',
	`role_id` VARCHAR COMMENT 'FK → roles',
	`role_key` VARCHAR DEFAULT 'user' COMMENT 'Cache key của role',
	`branch_id` VARCHAR COMMENT 'FK → branches',
	`is_email_verified` BOOLEAN DEFAULT false,
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	PRIMARY KEY(`id`)
) COMMENT='Người dùng';


CREATE UNIQUE INDEX `users_email_unique`
ON `users` (`email`);
CREATE TABLE IF NOT EXISTS `tokens` (
	`id` VARCHAR NOT NULL UNIQUE COMMENT 'ObjectId',
	`token` TEXT NOT NULL,
	`user_id` VARCHAR NOT NULL COMMENT 'FK → users',
	`type` ENUM('refresh', 'resetPassword', 'verifyEmail') NOT NULL,
	`expires` TIMESTAMP NOT NULL,
	`blacklisted` BOOLEAN DEFAULT false,
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	PRIMARY KEY(`id`)
) COMMENT='JWT Tokens (refresh / reset / verify)';


CREATE TABLE IF NOT EXISTS `products` (
	`id` VARCHAR NOT NULL UNIQUE COMMENT 'ObjectId',
	`code` VARCHAR NOT NULL,
	`branch_id` VARCHAR COMMENT 'FK → branches',
	`name` VARCHAR NOT NULL,
	`unit_id` VARCHAR NOT NULL COMMENT 'FK → units',
	`min_stock` DECIMAL DEFAULT 0,
	`selling_price` DECIMAL DEFAULT 0,
	`package` VARCHAR COMMENT 'Quy cách đóng gói',
	`image_path` VARCHAR,
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	PRIMARY KEY(`id`)
) COMMENT='Sản phẩm';


CREATE UNIQUE INDEX `products_code_unique`
ON `products` (`code`);
CREATE TABLE IF NOT EXISTS `product_batches` (
	`id` VARCHAR NOT NULL UNIQUE COMMENT 'ObjectId',
	`product_id` VARCHAR NOT NULL COMMENT 'FK → products',
	`product_code` VARCHAR COMMENT 'Snapshot code',
	`product_name` VARCHAR COMMENT 'Snapshot name',
	`unit_id` VARCHAR COMMENT 'FK → units',
	`warehouse_id` VARCHAR NOT NULL COMMENT 'FK → warehouses',
	`batch_code` VARCHAR NOT NULL,
	`manufacture_date` DATE,
	`expiry_date` DATE NOT NULL,
	`quantity` DECIMAL NOT NULL DEFAULT 0,
	`import_price` DECIMAL NOT NULL DEFAULT 0,
	`total_amount` DECIMAL DEFAULT 0,
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	PRIMARY KEY(`id`)
) COMMENT='Lô hàng nhập kho';


CREATE TABLE IF NOT EXISTS `suppliers` (
	`id` VARCHAR NOT NULL UNIQUE COMMENT 'ObjectId',
	`name` VARCHAR NOT NULL,
	`phone` VARCHAR,
	`email` VARCHAR,
	`address` VARCHAR,
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	PRIMARY KEY(`id`)
) COMMENT='Nhà cung cấp';


CREATE TABLE IF NOT EXISTS `customers` (
	`id` VARCHAR NOT NULL UNIQUE COMMENT 'ObjectId',
	`name` VARCHAR NOT NULL,
	`branch_id` VARCHAR NOT NULL COMMENT 'FK → branches',
	`phone` VARCHAR,
	`address` VARCHAR,
	`email` VARCHAR,
	`total_debt` DECIMAL DEFAULT 0,
	`note` TEXT,
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	PRIMARY KEY(`id`)
) COMMENT='Khách hàng';


CREATE TABLE IF NOT EXISTS `sales` (
	`id` VARCHAR NOT NULL UNIQUE COMMENT 'ObjectId',
	`code` VARCHAR NOT NULL,
	`status` ENUM('DRAFT', 'COMPLETED', 'CANCELLED') DEFAULT 'COMPLETED',
	`branch_id` VARCHAR NOT NULL COMMENT 'FK → branches',
	`warehouse_id` VARCHAR NOT NULL COMMENT 'FK → warehouses',
	`sold_by` VARCHAR COMMENT 'FK → users',
	`sale_date` TIMESTAMP,
	`customer_id` VARCHAR COMMENT 'FK → customers (nullable)',
	`customer_name` VARCHAR COMMENT 'Snapshot tên KH',
	`note` TEXT,
	`total_amount` DECIMAL NOT NULL DEFAULT 0,
	`discount_money` DECIMAL DEFAULT 0,
	`tax_money` DECIMAL DEFAULT 0,
	`total_amount_after_fax` DECIMAL DEFAULT 0 COMMENT 'Tên field đang bám đúng model hiện tại',
	`paid_amount` DECIMAL DEFAULT 0,
	`debt_amount` DECIMAL DEFAULT 0,
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	PRIMARY KEY(`id`)
) COMMENT='Đơn bán hàng';


CREATE UNIQUE INDEX `sales_code_unique`
ON `sales` (`code`);
CREATE TABLE IF NOT EXISTS `sale_items` (
	`id` VARCHAR NOT NULL UNIQUE COMMENT 'Sub-document',
	`sale_id` VARCHAR NOT NULL COMMENT 'FK → sales',
	`product_id` VARCHAR NOT NULL COMMENT 'FK → products',
	`batch_id` VARCHAR COMMENT 'FK → product_batches (nullable)',
	`quantity` DECIMAL NOT NULL DEFAULT 0,
	`price` DECIMAL NOT NULL DEFAULT 0 COMMENT 'Giá bán',
	`line_total` DECIMAL DEFAULT 0,
	`cost_price` DECIMAL DEFAULT 0 COMMENT 'Giá vốn snapshot',
	`cost_total` DECIMAL DEFAULT 0 COMMENT 'Tổng giá vốn dòng',
	PRIMARY KEY(`id`)
) COMMENT='Chi tiết đơn bán. Đây là bảng tách ra để trực quan hóa items[] embedded trong Sale.';


CREATE TABLE IF NOT EXISTS `inventory_transactions` (
	`id` VARCHAR NOT NULL UNIQUE COMMENT 'ObjectId',
	`type` ENUM('IMPORT', 'EXPORT') NOT NULL COMMENT 'Nhập hoặc Xuất',
	`reason` TEXT,
	`warehouse_id` VARCHAR NOT NULL COMMENT 'FK → warehouses',
	`supplier_id` VARCHAR COMMENT 'FK → suppliers (nullable, chỉ có khi IMPORT)',
	`sale_id` VARCHAR COMMENT 'FK → sales (nullable, chỉ có khi EXPORT do bán)',
	`created_by` VARCHAR COMMENT 'FK → users',
	`transaction_date` TIMESTAMP,
	`delivery_person` VARCHAR COMMENT 'Người giao hàng (khi nhập)',
	`total_amount` DECIMAL DEFAULT 0,
	`discount_money` DECIMAL DEFAULT 0,
	`tax_money` DECIMAL DEFAULT 0,
	`total_amount_after_fax` DECIMAL DEFAULT 0 COMMENT 'Tên field đang bám đúng model hiện tại',
	`status` ENUM('PENDING', 'COMPLETED', 'CANCELED') DEFAULT 'PENDING',
	`created_at` TIMESTAMP,
	`updated_at` TIMESTAMP,
	PRIMARY KEY(`id`)
) COMMENT='Phiếu nhập/xuất kho';


CREATE TABLE IF NOT EXISTS `inventory_transaction_items` (
	`id` VARCHAR NOT NULL UNIQUE COMMENT 'Sub-document',
	`transaction_id` VARCHAR NOT NULL COMMENT 'FK → inventory_transactions',
	`product_id` VARCHAR NOT NULL COMMENT 'FK → products',
	`batch_id` VARCHAR COMMENT 'FK → product_batches (nullable)',
	`quantity` DECIMAL NOT NULL DEFAULT 0,
	`price` DECIMAL DEFAULT 0 COMMENT 'Giá nhập/xuất',
	`total_amount` DECIMAL DEFAULT 0,
	`cost_price` DECIMAL DEFAULT 0 COMMENT 'Giá vốn snapshot (EXPORT)',
	`cost_total` DECIMAL DEFAULT 0 COMMENT 'Tổng giá vốn (EXPORT)',
	PRIMARY KEY(`id`)
) COMMENT='Chi tiết phiếu nhập/xuất. Đây là bảng tách ra để trực quan hóa items[] embedded trong InventoryTransaction.';


ALTER TABLE `warehouses`
ADD FOREIGN KEY(`branch_id`) REFERENCES `branches`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `permissions`
ADD FOREIGN KEY(`created_by`) REFERENCES `users`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `permissions`
ADD FOREIGN KEY(`updated_by`) REFERENCES `users`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `users`
ADD FOREIGN KEY(`role_id`) REFERENCES `roles`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `users`
ADD FOREIGN KEY(`branch_id`) REFERENCES `branches`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `tokens`
ADD FOREIGN KEY(`user_id`) REFERENCES `users`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `products`
ADD FOREIGN KEY(`branch_id`) REFERENCES `branches`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `products`
ADD FOREIGN KEY(`unit_id`) REFERENCES `units`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `product_batches`
ADD FOREIGN KEY(`product_id`) REFERENCES `products`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `product_batches`
ADD FOREIGN KEY(`unit_id`) REFERENCES `units`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `product_batches`
ADD FOREIGN KEY(`warehouse_id`) REFERENCES `warehouses`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `customers`
ADD FOREIGN KEY(`branch_id`) REFERENCES `branches`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `sales`
ADD FOREIGN KEY(`branch_id`) REFERENCES `branches`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `sales`
ADD FOREIGN KEY(`warehouse_id`) REFERENCES `warehouses`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `sales`
ADD FOREIGN KEY(`sold_by`) REFERENCES `users`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `sales`
ADD FOREIGN KEY(`customer_id`) REFERENCES `customers`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `sale_items`
ADD FOREIGN KEY(`sale_id`) REFERENCES `sales`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `sale_items`
ADD FOREIGN KEY(`product_id`) REFERENCES `products`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `sale_items`
ADD FOREIGN KEY(`batch_id`) REFERENCES `product_batches`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `inventory_transactions`
ADD FOREIGN KEY(`warehouse_id`) REFERENCES `warehouses`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `inventory_transactions`
ADD FOREIGN KEY(`supplier_id`) REFERENCES `suppliers`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `inventory_transactions`
ADD FOREIGN KEY(`sale_id`) REFERENCES `sales`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `inventory_transactions`
ADD FOREIGN KEY(`created_by`) REFERENCES `users`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `inventory_transaction_items`
ADD FOREIGN KEY(`transaction_id`) REFERENCES `inventory_transactions`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `inventory_transaction_items`
ADD FOREIGN KEY(`product_id`) REFERENCES `products`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;
ALTER TABLE `inventory_transaction_items`
ADD FOREIGN KEY(`batch_id`) REFERENCES `product_batches`(`id`)
ON UPDATE NO ACTION ON DELETE NO ACTION;