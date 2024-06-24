ALTER TABLE `episode` ADD COLUMN `cache_uri` TEXT;
UPDATE `episode` SET `cache_uri` = `uri`;
