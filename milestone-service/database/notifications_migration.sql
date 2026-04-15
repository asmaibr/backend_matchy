-- Notifications Table
USE matchy_db;

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_type ENUM('company', 'freelancer') NOT NULL,
    type ENUM('application_received', 'application_accepted', 'application_rejected', 'interview_scheduled') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    application_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- Add index for faster queries
CREATE INDEX idx_user_notifications ON notifications(user_id, user_type, is_read);
CREATE INDEX idx_created_at ON notifications(created_at DESC);
