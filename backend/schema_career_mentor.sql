-- DevPath AI - Career Mentor Schema Updates

USE devpath_ai;

-- Drop old tables if they interfere to ensure clean mapping
DROP TABLE IF EXISTS career_mentor_results;
DROP TABLE IF EXISTS career_plans;

-- 1. Refined Career Plans Table (Profile Inputs)
CREATE TABLE career_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    student_name VARCHAR(100) NOT NULL,
    college VARCHAR(150) NOT NULL,
    year INT NOT NULL,
    degree VARCHAR(100) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    current_skills TEXT NOT NULL,
    interested_skills TEXT NOT NULL,
    career_goal VARCHAR(150) NOT NULL,
    dream_company VARCHAR(150) NOT NULL,
    daily_hours INT NOT NULL,
    cgpa DECIMAL(4,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Career Mentor AI Results Table (Outputs)
CREATE TABLE career_mentor_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    skill_gap_analysis JSON NOT NULL,
    roadmap_90_day JSON NOT NULL,
    weekly_learning_plan JSON NOT NULL,
    monthly_goals JSON NOT NULL,
    recommended_courses JSON NOT NULL,
    books JSON NOT NULL,
    youtube_channels JSON NOT NULL,
    projects_to_build JSON NOT NULL,
    interview_topics JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
