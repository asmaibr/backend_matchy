-- Add rating column to work_submissions table
-- This allows companies to rate approved work submissions

USE matchy_db;

-- Add rating column (1-5 stars)
ALTER TABLE work_submissions 
ADD COLUMN IF NOT EXISTS rating INT DEFAULT NULL CHECK (rating >= 1 AND rating <= 5);

-- Add index for rating queries
ALTER TABLE work_submissions
ADD INDEX IF NOT EXISTS idx_rating (rating);

-- Update existing approved submissions to have a default rating of 0 (not rated)
-- Companies can update this when they review
UPDATE work_submissions 
SET rating = 0 
WHERE status = 'approved' AND rating IS NULL;

SELECT 'Rating column added successfully to work_submissions table' AS status;
