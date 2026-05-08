require('dotenv').config();
const db = require('../config/db');

async function createNotificationsTable() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS user_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        order_id INT DEFAULT NULL,
        message TEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await db.query(query);
    console.log('✅ user_notifications table created or already exists');
  } catch (err) {
    console.error('❌ Error creating table:', err);
  } finally {
    process.exit();
  }
}

createNotificationsTable();
