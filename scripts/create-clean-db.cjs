const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');

async function createCleanDatabase(targetFile) {
  const resolvedTarget = path.resolve(targetFile);
  if (fs.existsSync(resolvedTarget)) {
    fs.unlinkSync(resolvedTarget);
  }

  const client = createClient({
    url: 'file:' + resolvedTarget.replace(/\\/g, '/')
  });

  const schema = [
    `CREATE TABLE profile (
      id INTEGER PRIMARY KEY,
      full_name TEXT,
      nim TEXT,
      university TEXT,
      division TEXT,
      mentor_name TEXT,
      mentor_nip TEXT,
      start_date DATE,
      end_date DATE,
      avatar TEXT
    );`,
    `CREATE TABLE daily_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      hours_spent REAL NOT NULL DEFAULT 8.0,
      status TEXT NOT NULL DEFAULT 'Selesai',
      description TEXT,
      output TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT NOT NULL DEFAULT 'Medium',
      due_date DATETIME,
      status TEXT NOT NULL DEFAULT 'Todo',
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE knowledge_base (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_type TEXT,
      category TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATE NOT NULL UNIQUE,
      time_in TIME,
      time_out TIME,
      status TEXT NOT NULL DEFAULT 'Hadir (WFO)',
      work_location TEXT DEFAULT 'Kantor BPS',
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`
  ];

  for (const sql of schema) {
    await client.execute(sql);
  }

  const today = new Date().toISOString().split('T')[0];
  await client.execute({
    sql: `INSERT INTO profile (id, full_name, nim, university, division, mentor_name, mentor_nip, start_date, end_date)
          VALUES (1, '', '', '', 'Badan Pusat Statistik', '', '', ?, ?);`,
    args: [today, today]
  });

  console.log('[CleanDB] Created clean database at:', resolvedTarget);
}

const targetPath = process.argv[2] || path.resolve(__dirname, '..', 'clean_laporan_bps.sqlite');
createCleanDatabase(targetPath).catch(err => {
  console.error('[CleanDB] Failed to create clean database:', err);
  process.exit(1);
});
