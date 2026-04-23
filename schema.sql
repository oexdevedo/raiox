-- MySQL Schema for Raio X Exdevedor

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS interactions;
DROP TABLE IF EXISTS behavioral_answers;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS incomes;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS custom_buttons;
DROP TABLE IF EXISTS admins;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  gender VARCHAR(50) NOT NULL DEFAULT '',
  region VARCHAR(255) NOT NULL DEFAULT '',
  birth_date VARCHAR(50) NOT NULL DEFAULT '',
  whatsapp VARCHAR(50) NOT NULL DEFAULT '',
  profession VARCHAR(255) NOT NULL DEFAULT '',
  contact_status VARCHAR(50) NOT NULL DEFAULT 'Pendente',
  last_contact_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE incomes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'outros',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE behavioral_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_email VARCHAR(255) UNIQUE NOT NULL,
  answers JSON NOT NULL,
  total_score INT NOT NULL DEFAULT 0,
  total_percentage INT NOT NULL DEFAULT 0,
  level VARCHAR(100) NOT NULL DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE custom_buttons (
  id INT PRIMARY KEY,
  config JSON NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE interactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_email VARCHAR(255),
  action VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default custom buttons config
INSERT IGNORE INTO custom_buttons (id, config) VALUES (1, '{"negative":{"visible":false,"label":"","url":"","message":""},"neutral":{"visible":false,"label":"","url":"","message":""},"positive":{"visible":false,"label":"","url":"","message":""}}');

-- Seed master admin (Password: Gr@nd34rtun@)
INSERT IGNORE INTO admins (email, password_hash) VALUES ('exdevedor@exdevedor.com.br', '835c60205562725458319e70197933b8a927a42337d99548455e714152520858');
