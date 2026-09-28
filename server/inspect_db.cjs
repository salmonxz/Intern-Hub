const { query, dbPath } = require('./db.cjs');

async function check() {
  console.log('Database Path:', dbPath);
  const tables = await query("SELECT name, sql FROM sqlite_master WHERE type='table';");
  console.log('\n=== LIST TABEL DI laporan_bps.sqlite ===');
  for (const t of tables.rows) {
    if (t.name.startsWith('sqlite_')) continue;
    const count = await query(`SELECT COUNT(*) as c FROM ${t.name};`);
    console.log(`\nTabel: [${t.name}] (${count.rows[0].c} baris)`);
    console.log(`Schema SQL:\n${t.sql}\n`);
  }
}

check().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
