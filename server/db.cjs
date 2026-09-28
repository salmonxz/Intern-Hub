const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '..', 'laporan_bps.sqlite');
const dbUrl = `file:${dbPath.replace(/\\/g, '/')}`;

const client = createClient({
  url: dbUrl,
});

// Helper for executing queries with parameters
async function query(sql, args = []) {
  try {
    const result = await client.execute({ sql, args });
    return result;
  } catch (error) {
    console.error('Database query error:', error, 'SQL:', sql);
    throw error;
  }
}

async function initDatabase() {
  // 1. Profile table
  await query(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY,
      full_name TEXT NOT NULL DEFAULT '',
      nim TEXT DEFAULT '',
      university TEXT DEFAULT '',
      division TEXT DEFAULT '',
      mentor_name TEXT DEFAULT '',
      mentor_nip TEXT DEFAULT '',
      start_date DATE,
      end_date DATE,
      target_hours INTEGER DEFAULT 0,
      avatar_url TEXT DEFAULT ''
    );
  `);

  // 2. Daily logs table
  await query(`
    CREATE TABLE IF NOT EXISTS daily_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      hours_spent REAL NOT NULL DEFAULT 7.5,
      status TEXT NOT NULL DEFAULT 'Selesai',
      output TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Tasks table
  await query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT NOT NULL DEFAULT 'Medium',
      due_date DATETIME,
      status TEXT NOT NULL DEFAULT 'Todo',
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Knowledge Base table
  await query(`
    CREATE TABLE IF NOT EXISTS knowledge_base (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Documents table
  await query(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_type TEXT,
      category TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Attendance table
  await query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL UNIQUE,
      time_in TIME,
      time_out TIME,
      status TEXT NOT NULL DEFAULT 'Hadir (WFO)',
      work_location TEXT DEFAULT 'Kantor BPS',
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Check if profile exists, if not initialize clean profile
  const profileRes = await query(`SELECT COUNT(*) as count FROM profile;`);
  const profileCount = Number(profileRes.rows[0]?.count || 0);

  if (profileCount === 0) {
    const today = new Date().toISOString().split('T')[0];
    await query(`
      INSERT INTO profile (id, full_name, nim, university, division, mentor_name, start_date, end_date)
      VALUES (1, '', '', '', '', '', ?, ?);
    `, [today, today]);
  }
}

async function cleanDatabase() {
  await query('DELETE FROM daily_logs;');
  await query('DELETE FROM tasks;');
  await query('DELETE FROM knowledge_base;');
  await query('DELETE FROM documents;');
  await query('DELETE FROM attendance;');
  await query('DELETE FROM profile;');
  
  const today = new Date().toISOString().split('T')[0];
  await query(`
    INSERT INTO profile (id, full_name, nim, university, division, mentor_name, start_date, end_date)
    VALUES (1, '', '', '', '', '', ?, ?);
  `, [today, today]);
}

module.exports = {
  client,
  query,
  initDatabase,
  cleanDatabase,
  dbPath
};
