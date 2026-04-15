-- Matchy Database Schema
CREATE DATABASE IF NOT EXISTS matchy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE matchy_db;

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    description TEXT,
    details_of_work TEXT,
    number_of_people_demanded INT NOT NULL,
    budget DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'TND',
    category VARCHAR(100),
    status ENUM('open', 'in_progress', 'closed') DEFAULT 'open',
    click_count INT DEFAULT 0,
    skills JSON,
    location VARCHAR(255),
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Milestones Table
CREATE TABLE IF NOT EXISTS milestones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    skills JSON,
    budget DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'TND',
    duration VARCHAR(100),
    status ENUM('open', 'assigned', 'in_progress', 'completed') DEFAULT 'open',
    assigned_freelancer_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    milestone_id INT NOT NULL,
    project_id INT NOT NULL,
    freelancer_id INT NOT NULL,
    freelancer_name VARCHAR(255) NOT NULL,
    freelancer_email VARCHAR(255) NOT NULL,
    cv_url TEXT,
    motivation_letter TEXT NOT NULL,
    years_of_experience INT NOT NULL,
    proposed_budget DECIMAL(10, 2),
    status ENUM('pending', 'interview_scheduled', 'interview_confirmed', 'accepted', 'rejected') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Interviews Table
CREATE TABLE IF NOT EXISTS interviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL UNIQUE,
    meet_link TEXT NOT NULL,
    interview_date DATE NOT NULL,
    interview_time TIME NOT NULL,
    notes TEXT,
    confirmed_by_freelancer BOOLEAN DEFAULT FALSE,
    scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- Insert Sample Data
INSERT INTO projects (company_name, project_title, description, details_of_work, number_of_people_demanded, budget, currency, category, status, skills, location, deadline) VALUES
('TechStart Tunisia', 'E-commerce Platform Development', 'Build a modern e-commerce platform with payment integration', 'We need experienced developers to build a full-stack e-commerce solution with Angular frontend, Node.js backend, and payment gateway integration. The platform should support multiple vendors and have an admin dashboard.', 3, 15000, 'TND', 'Web Development', 'open', '["Angular", "Node.js", "MongoDB", "Payment Integration"]', 'Tunis', '2025-06-30'),
('Digital Marketing Pro', 'Mobile App UI/UX Design', 'Design modern and intuitive mobile app interface', 'Looking for talented UI/UX designers to create a complete design system for our mobile application. Must include wireframes, prototypes, and final designs in Figma.', 2, 8000, 'TND', 'Design', 'open', '["Figma", "UI/UX", "Mobile Design", "Prototyping"]', 'Sfax', '2025-04-15'),
('DataViz Solutions', 'Data Analytics Dashboard', 'Create interactive data visualization dashboard', 'Develop a comprehensive analytics dashboard with real-time data visualization, charts, and reporting features. Should integrate with existing APIs and databases.', 2, 12000, 'TND', 'Data Science', 'open', '["React", "D3.js", "Python", "SQL"]', 'Remote', '2025-05-20');

INSERT INTO milestones (project_id, title, description, skills, budget, currency, duration, status) VALUES
(1, 'Frontend Development', 'Develop the complete frontend using Angular 18 with responsive design', '["Angular", "TypeScript", "SCSS", "Responsive Design"]', 6000, 'TND', '2 months', 'open'),
(1, 'Backend API Development', 'Build RESTful API with Node.js, Express, and MongoDB', '["Node.js", "Express", "MongoDB", "REST API"]', 5000, 'TND', '1.5 months', 'open'),
(1, 'Payment Gateway Integration', 'Integrate payment gateway (Stripe/PayPal) with security best practices', '["Payment Integration", "Security", "Node.js"]', 4000, 'TND', '3 weeks', 'open'),
(2, 'UI/UX Design', 'Create complete design system with wireframes and prototypes', '["Figma", "UI/UX", "Prototyping"]', 5000, 'TND', '1 month', 'open'),
(2, 'Mobile App Design Implementation', 'Implement the designs in React Native', '["React Native", "Mobile Development"]', 3000, 'TND', '3 weeks', 'open'),
(3, 'Data Visualization Dashboard', 'Create interactive charts and graphs for analytics', '["D3.js", "React", "Data Visualization"]', 4000, 'TND', '1 month', 'open');
