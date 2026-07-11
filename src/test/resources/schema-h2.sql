-- ============================================================
-- Library Full-Stack Schema — H2 (MySQL mode compatible)
-- ============================================================

DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `holds`;
DROP TABLE IF EXISTS `fines`;
DROP TABLE IF EXISTS `borrow_records`;
DROP TABLE IF EXISTS `book_items`;
DROP TABLE IF EXISTS `books`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `circulation_rules`;
DROP TABLE IF EXISTS `item_types`;
DROP TABLE IF EXISTS `patron_categories`;

-- 1. Patron Categories
CREATE TABLE `patron_categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id`)
);

-- 2. Item Types
CREATE TABLE `item_types` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `loanDays` INT NOT NULL DEFAULT 0,
  `fineRate` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `created_at` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id`)
);

-- 3. Circulation Rules
CREATE TABLE `circulation_rules` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `patronCategoryId` INT NOT NULL,
  `itemTypeId` INT NOT NULL,
  `maxBorrows` INT NOT NULL DEFAULT 5,
  `loanDays` INT NOT NULL DEFAULT 30,
  `renewals` INT NOT NULL DEFAULT 0,
  `renewalDays` INT NOT NULL DEFAULT 0,
  `finePerDay` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `created_at` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rule_patron_item` (`patronCategoryId`, `itemTypeId`)
);

-- 4. Users
CREATE TABLE `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'reader',
  `phone` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `total_fines` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `patronCategoryId` INT DEFAULT NULL,
  `token_version` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT NOW(),
  `updated_at` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
);

-- 5. Categories
CREATE TABLE `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `desc` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT NOW(),
  `updated_at` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id`)
);

-- 6. Books
CREATE TABLE `books` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `isbn` VARCHAR(20) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `author` VARCHAR(200) DEFAULT NULL,
  `publisher` VARCHAR(200) DEFAULT NULL,
  `year` INT DEFAULT NULL,
  `total` INT NOT NULL DEFAULT 0,
  `available` INT NOT NULL DEFAULT 0,
  `status` VARCHAR(20) DEFAULT 'available',
  `location` VARCHAR(200) DEFAULT NULL,
  `cover` VARCHAR(500) DEFAULT NULL,
  `desc` TEXT DEFAULT NULL,
  `clcNumber` VARCHAR(50) DEFAULT NULL,
  `physicalDesc` VARCHAR(200) DEFAULT NULL,
  `language` VARCHAR(10) DEFAULT 'chi',
  `country` VARCHAR(10) DEFAULT 'CN',
  `categoryId` INT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT NOW(),
  `updated_at` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_isbn` (`isbn`)
);

-- 7. Book Items (copies)
CREATE TABLE `book_items` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `barcode` VARCHAR(50) NOT NULL,
  `callNumber` VARCHAR(50) DEFAULT NULL,
  `location` VARCHAR(200) DEFAULT NULL,
  `condition` VARCHAR(20) DEFAULT 'normal',
  `status` VARCHAR(20) DEFAULT 'available',
  `price` DECIMAL(10,2) DEFAULT NULL,
  `acquired_at` DATETIME DEFAULT NULL,
  `notes` VARCHAR(500) DEFAULT NULL,
  `campus` VARCHAR(50) DEFAULT NULL,
  `requests` INT NOT NULL DEFAULT 0,
  `bookId` INT NOT NULL,
  `itemTypeId` INT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT NOW(),
  `updated_at` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_barcode` (`barcode`)
);

-- 8. Borrow Records
CREATE TABLE `borrow_records` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `bookId` INT NOT NULL,
  `bookItemId` INT NOT NULL,
  `borrow_date` DATETIME DEFAULT NULL,
  `due_date` DATETIME DEFAULT NULL,
  `return_date` DATETIME DEFAULT NULL,
  `renewed` TINYINT(1) DEFAULT 0,
  `status` VARCHAR(20) DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT NOW(),
  `updated_at` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id`)
);

-- 9. Fines
CREATE TABLE `fines` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `borrowRecordId` INT DEFAULT NULL,
  `userId` INT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `type` VARCHAR(20) DEFAULT 'overdue',
  `paid` TINYINT(1) DEFAULT 0,
  `paid_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id`)
);

-- 10. Holds
CREATE TABLE `holds` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `bookId` INT NOT NULL,
  `bookItemId` INT DEFAULT NULL,
  `status` VARCHAR(20) DEFAULT 'pending',
  `request_date` DATETIME DEFAULT NULL,
  `expiry_date` DATETIME DEFAULT NULL,
  `fulfilled_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id`)
);

-- 11. Audit Logs
CREATE TABLE `audit_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT DEFAULT NULL,
  `action` VARCHAR(100) DEFAULT NULL,
  `target` VARCHAR(100) DEFAULT NULL,
  `detail` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`id`)
);
