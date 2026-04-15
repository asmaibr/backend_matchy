-- Workspace features for accepted milestones
USE matchy_db;

-- Team Chat Messages
CREATE TABLE IF NOT EXISTS milestone_chat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    milestone_id INT NOT NULL,
    user_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_type ENUM('company', 'freelancer') NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE,
    INDEX idx_milestone_chat (milestone_id, created_at DESC)
);

-- Work Submissions
CREATE TABLE IF NOT EXISTS work_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    milestone_id INT NOT NULL,
    freelancer_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT,
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    status ENUM('pending', 'approved', 'revision_requested', 'rejected') DEFAULT 'pending',
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE,
    INDEX idx_milestone_submissions (milestone_id, submitted_at DESC)
);

-- Add workspace_access column to applications table if not exists
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS workspace_access BOOLEAN DEFAULT FALSE;

-- Update workspace_access for accepted applications
UPDATE applications SET workspace_access = TRUE WHERE status = 'accepted';
