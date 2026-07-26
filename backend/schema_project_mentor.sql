-- DevPath AI - Project Mentor Schema Updates

USE devpath_ai;

DROP TABLE IF EXISTS project_mentor_blueprints;
DROP TABLE IF EXISTS project_mentor_profiles;

-- 1. Project Mentor Profiles (Inputs)
CREATE TABLE project_mentor_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    skills TEXT NOT NULL,
    domain VARCHAR(100) NOT NULL,
    difficulty ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
    available_time VARCHAR(100) NOT NULL,
    team_size INT NOT NULL,
    language VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Project Mentor Blueprints (AI Generated Outputs)
CREATE TABLE project_mentor_blueprints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    project_title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    features JSON NOT NULL,
    architecture TEXT NOT NULL,
    folder_structure JSON NOT NULL,
    frontend JSON NOT NULL,
    backend JSON NOT NULL,
    database_schema JSON NOT NULL,
    api_list JSON NOT NULL,
    timeline JSON NOT NULL,
    deployment TEXT NOT NULL,
    testing JSON NOT NULL,
    future_scope JSON NOT NULL,
    interview_questions JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
