CREATE DATABASE IF NOT EXISTS mathmaster;
USE mathmaster;

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  age INT NOT NULL,
  is_verified TINYINT DEFAULT 0,
  is_blocked TINYINT DEFAULT 0,
  initialPercentage Int DEFAULT 0,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
);
CREATE TABLE IF NOT EXISTS admins (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
);
CREATE TABLE IF NOT EXISTS otps (
  otp_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  code VARCHAR(10) NOT NULL,
  expires_at DATETIME NOT NULL,
  used TINYINT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users (user_id)
);

CREATE TABLE IF NOT EXISTS levels (
  level_id INT AUTO_INCREMENT PRIMARY KEY,
  level_name VARCHAR(50) NOT NULL,
  min_passing_percentage INT NOT NULL DEFAULT 70
);

CREATE TABLE IF NOT EXISTS sublevels (
  sublevel_id INT AUTO_INCREMENT PRIMARY KEY,
  level_id INT NOT NULL,
  sublevel_discription VARCHAR(255) NOT NULL;
  ALTER TABLE sublevels
  FOREIGN KEY (level_id) REFERENCES levels (level_id)
);

CREATE TABLE IF NOT EXISTS questions (
  question_id INT AUTO_INCREMENT PRIMARY KEY,
  level_id INT NOT NULL,
  sublevel_id INT,
  difficulty VARCHAR(20),
  question_text TEXT NOT NULL,
  correct_answer VARCHAR(100),
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (level_id) REFERENCES levels (level_id),
  FOREIGN KEY (sublevel_id) REFERENCES sublevels (sublevel_id)
);

CREATE TABLE IF NOT EXISTS hints (
  hint_id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  hint_text TEXT NOT NULL,
  FOREIGN KEY (question_id) REFERENCES questions (question_id)
);
CREATE TABLE IF NOT EXISTS initial_quiz (
  quiz_id INT AUTO_INCREMENT PRIMARY KEY,
  question_text TEXT NOT NULL,
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  option_c VARCHAR(255) NOT NULL,
  option_d VARCHAR(255) NOT NULL,
  correct_option CHAR(1) NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
);

CREATE TABLE IF NOT EXISTS performance (
  performance_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  level_id INT NOT NULL,
  sublevel_id INT,
  correct_answers INT,
  total_questions INT,
  quiz_score FLOAT,
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users (user_id),
  FOREIGN KEY (level_id) REFERENCES levels (level_id),
  FOREIGN KEY (sublevel_id) REFERENCES sublevels (sublevel_id)
);

CREATE TABLE IF NOT EXISTS user_progress (
  progress_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  level_id INT NOT NULL,
  sublevel_id INT NOT NULL,
  status VARCHAR(20) DEFAULT 'in-progress',
  FOREIGN KEY (user_id) REFERENCES users (user_id),
  FOREIGN KEY (level_id) REFERENCES levels (level_id),
  FOREIGN KEY (sublevel_id) REFERENCES sublevels (sublevel_id)
);

INSERT INTO levels (level_name, min_passing_percentage) VALUES ('Level 1', 70), ('Level 2', 70), ('Level 3', 70);
INSERT INTO sublevels (level_id, sublevel_number) VALUES (1,1),(1,2),(1,3),(2,1),(2,2),(2,3),(3,1),(3,2),(3,3);
