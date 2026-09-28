const { query, initDatabase } = require('./db.cjs');
const fs = require('fs');
const path = require('path');

async function cleanAll() {
  await initDatabase();
  console.log('Purging all dummy data from laporan_bps.sqlite...');
  await query('DELETE FROM daily_logs;');
  await query('DELETE FROM tasks;');
  await query('DELETE FROM knowledge_base;');
  await query('DELETE FROM documents;');
  await query('DELETE FROM profile;');
  
  const today = new Date().toISOString().split('T')[0];
  await query(
    'INSERT INTO profile (id, full_name, nim, university, division, mentor_name, start_date, end_date) VALUES (1, ?, ?, ?, ?, ?, ?, ?);',
    ['', '', '', '', '', today, today]
  );

  // Clean physical files in uploads
  const uploadsDir = path.resolve(__dirname, '..', 'uploads');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    for (const f of files) {
      try {
        fs.unlinkSync(path.join(uploadsDir, f));
      } catch (e) {
        console.warn('Could not delete:', f);
      }
    }
  }

  console.log('Database and uploads folder successfully cleaned and fresh!');
}

cleanAll().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
