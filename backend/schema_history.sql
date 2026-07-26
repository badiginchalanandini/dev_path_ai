-- DevPath AI - Generation History Schema Updates

USE devpath_ai;

DROP TABLE IF EXISTS generation_history;

CREATE TABLE generation_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('career_plan', 'project_plan') NOT NULL,
    title VARCHAR(255) NOT NULL,
    payload JSON NOT NULL,
    is_favorite TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_history_user_type (user_id, type),
    INDEX idx_history_favorite (user_id, is_favorite)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
