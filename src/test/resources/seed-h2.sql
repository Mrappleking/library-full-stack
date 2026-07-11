-- Test seed data for H2
-- Admin user (password: admin123, BCrypt hash)
INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`, `phone`, `email`, `total_fines`, `token_version`, `created_at`, `updated_at`)
VALUES (1, 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '管理员', 'admin', '13800000000', 'admin@library.com', 0.00, 0, NOW(), NOW());

-- Reader user (password: reader123)
INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`, `phone`, `email`, `total_fines`, `token_version`, `created_at`, `updated_at`)
VALUES (2, 'reader1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '读者一', 'reader', '13900000000', 'reader1@library.com', 0.00, 0, NOW(), NOW());

-- Sample categories
INSERT INTO `categories` (`id`, `name`, `desc`, `created_at`, `updated_at`)
VALUES (1, '计算机', '计算机科学与技术', NOW(), NOW());
INSERT INTO `categories` (`id`, `name`, `desc`, `created_at`, `updated_at`)
VALUES (2, '文学', '文学类图书', NOW(), NOW());

-- Patron categories
INSERT INTO `patron_categories` (`id`, `name`, `created_at`)
VALUES (1, '本科生', NOW());
INSERT INTO `patron_categories` (`id`, `name`, `created_at`)
VALUES (2, '研究生', NOW());

-- Item types
INSERT INTO `item_types` (`id`, `name`, `loanDays`, `fineRate`, `created_at`)
VALUES (1, '普通图书', 30, 0.10, NOW());
INSERT INTO `item_types` (`id`, `name`, `loanDays`, `fineRate`, `created_at`)
VALUES (2, '期刊', 7, 0.50, NOW());
