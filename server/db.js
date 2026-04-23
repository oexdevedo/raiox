import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import crypto from 'node:crypto';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'raiox',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database schema
export const initDB = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
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
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS incomes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'outros',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS behavioral_answers (
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
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS custom_buttons (
        id INT PRIMARY KEY,
        config JSON NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS interactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(255),
        action VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seed default custom buttons config
    await connection.query(`
      INSERT IGNORE INTO custom_buttons (id, config) VALUES (1, '{"negative":{"visible":false,"label":"","url":"","message":""},"neutral":{"visible":false,"label":"","url":"","message":""},"positive":{"visible":false,"label":"","url":"","message":""}}')
    `);

    // Seed master admin
    const masterEmail = 'exdevedor@exdevedor.com.br';
    const masterPassword = 'Gr@nd34rtun@';
    const hash = crypto.createHash('sha256').update(masterPassword).digest('hex');
    await connection.query('INSERT IGNORE INTO admins (email, password_hash) VALUES (?, ?)', [masterEmail, hash]);

    console.log('[DB] MySQL database initialized');
  } catch (err) {
    console.error('[DB] Initialization error:', err);
  } finally {
    connection.release();
  }
};

export default pool;

