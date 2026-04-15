-- Advanced Features Migration
USE matchy_db;

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    application_id INT NOT NULL,
    milestone_id INT NOT NULL,
    freelancer_id INT NOT NULL,
    company_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'TND',
    payment_method ENUM('stripe', 'paypal', 'bank_transfer', 'cash') DEFAULT 'bank_transfer',
    payment_status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    payment_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES work_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE,
    INDEX idx_freelancer (freelancer_id),
    INDEX idx_company (company_id),
    INDEX idx_status (payment_status)
);

-- Freelancer Profiles Table (for AI matching)
CREATE TABLE IF NOT EXISTS freelancer_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    freelancer_id INT NOT NULL UNIQUE,
    freelancer_name VARCHAR(255) NOT NULL,
    freelancer_email VARCHAR(255) NOT NULL,
    skills JSON,
    experience_years INT DEFAULT 0,
    hourly_rate DECIMAL(10, 2),
    availability ENUM('available', 'busy', 'unavailable') DEFAULT 'available',
    location VARCHAR(255),
    bio TEXT,
    portfolio_url TEXT,
    total_projects INT DEFAULT 0,
    completed_projects INT DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    success_rate DECIMAL(5, 2) DEFAULT 0.00,
    response_time_hours INT DEFAULT 24,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_skills (skills(255)),
    INDEX idx_rating (average_rating),
    INDEX idx_availability (availability)
);

-- Project Recommendations Table
CREATE TABLE IF NOT EXISTS project_recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    freelancer_id INT NOT NULL,
    project_id INT NOT NULL,
    match_score DECIMAL(5, 2) NOT NULL,
    matching_skills JSON,
    reason TEXT,
    viewed BOOLEAN DEFAULT FALSE,
    applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_freelancer (freelancer_id),
    INDEX idx_score (match_score),
    INDEX idx_viewed (viewed)
);

-- Search History Table
CREATE TABLE IF NOT EXISTS search_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_type ENUM('company', 'freelancer') NOT NULL,
    search_query TEXT,
    filters JSON,
    results_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id, user_type)
);

-- Saved Searches Table
CREATE TABLE IF NOT EXISTS saved_searches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_type ENUM('company', 'freelancer') NOT NULL,
    search_name VARCHAR(255) NOT NULL,
    search_query TEXT,
    filters JSON,
    notify_on_match BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user (user_id, user_type)
);

-- Freelancer Skills Table (for better search)
CREATE TABLE IF NOT EXISTS freelancer_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    freelancer_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    years_experience INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (freelancer_id) REFERENCES freelancer_profiles(freelancer_id) ON DELETE CASCADE,
    UNIQUE KEY unique_freelancer_skill (freelancer_id, skill_name),
    INDEX idx_skill (skill_name),
    INDEX idx_proficiency (proficiency_level)
);

-- Insert sample freelancer profiles
INSERT INTO freelancer_profiles (freelancer_id, freelancer_name, freelancer_email, skills, experience_years, hourly_rate, location, bio, total_projects, completed_projects, average_rating, success_rate) VALUES
(1, 'Ahmed Ben Ali', 'ahmed.benali@email.com', '["Angular", "TypeScript", "Node.js", "MongoDB"]', 5, 45.00, 'Tunis', 'Full-stack developer with 5 years of experience in web development', 15, 13, 4.8, 86.67),
(2, 'Fatma Mansour', 'fatma.mansour@email.com', '["React", "Vue.js", "JavaScript", "CSS"]', 3, 35.00, 'Sfax', 'Frontend specialist passionate about creating beautiful user interfaces', 10, 9, 4.6, 90.00),
(3, 'Mohamed Trabelsi', 'mohamed.trabelsi@email.com', '["Python", "Django", "PostgreSQL", "Docker"]', 7, 55.00, 'Sousse', 'Backend engineer with expertise in scalable systems', 20, 18, 4.9, 90.00),
(4, 'Salma Karoui', 'salma.karoui@email.com', '["Figma", "UI/UX", "Adobe XD", "Prototyping"]', 4, 40.00, 'Tunis', 'UI/UX designer focused on user-centered design', 12, 11, 4.7, 91.67),
(5, 'Youssef Gharbi', 'youssef.gharbi@email.com', '["React Native", "Flutter", "Mobile Development"]', 4, 50.00, 'Ariana', 'Mobile app developer with cross-platform expertise', 8, 7, 4.5, 87.50);

-- Insert sample skills
INSERT INTO freelancer_skills (freelancer_id, skill_name, proficiency_level, years_experience) VALUES
(1, 'Angular', 'expert', 5),
(1, 'TypeScript', 'expert', 5),
(1, 'Node.js', 'advanced', 4),
(1, 'MongoDB', 'advanced', 3),
(2, 'React', 'expert', 3),
(2, 'Vue.js', 'advanced', 2),
(2, 'JavaScript', 'expert', 3),
(3, 'Python', 'expert', 7),
(3, 'Django', 'expert', 6),
(3, 'PostgreSQL', 'advanced', 5),
(4, 'Figma', 'expert', 4),
(4, 'UI/UX', 'expert', 4),
(5, 'React Native', 'expert', 4),
(5, 'Flutter', 'advanced', 2);
