-- Fix CV column to support large base64 files
-- Run this in phpMyAdmin or MySQL command line

USE matchy_db;

-- Change cv_url column type from TEXT to LONGTEXT
-- LONGTEXT can store up to 4GB of data (enough for base64 encoded files)
ALTER TABLE applications MODIFY COLUMN cv_url LONGTEXT;

-- Verify the change
DESCRIBE applications;
