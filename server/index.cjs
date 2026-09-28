const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const XLSX = require('xlsx');
const { query, initDatabase, cleanDatabase, dbPath } = require('./db.cjs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Serve static frontend build
const distPath = path.resolve(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Storage configuration for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.resolve(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${safeName}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

// ==========================================
// 1. PROFILE API
// ==========================================
app.get('/api/profile', async (req, res) => {
  try {
    const result = await query('SELECT * FROM profile WHERE id = 1;');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/profile', async (req, res) => {
  try {
    const {
      full_name,
      nim,
      university,
      division,
      mentor_name,
      mentor_nip,
      start_date,
      end_date,
      target_hours,
      avatar_url
    } = req.body;

    await query(
      `UPDATE profile 
       SET full_name = ?, nim = ?, university = ?, division = ?, mentor_name = ?, mentor_nip = ?, start_date = ?, end_date = ?, target_hours = ?, avatar_url = ?
       WHERE id = 1;`,
      [
        full_name || '',
        nim || '',
        university || '',
        division || '',
        mentor_name || '',
        mentor_nip || '',
        start_date || '2026-07-01',
        end_date || '2026-09-30',
        target_hours || 320,
        avatar_url || ''
      ]
    );

    const updated = await query('SELECT * FROM profile WHERE id = 1;');
    res.json(updated.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. DAILY LOGS API
// ==========================================
app.get('/api/daily-logs', async (req, res) => {
  try {
    const { startDate, endDate, category, status, search } = req.query;

    let sql = 'SELECT * FROM daily_logs WHERE 1=1';
    const params = [];

    if (startDate) {
      sql += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND date <= ?';
      params.push(endDate);
    }
    if (category && category !== 'Semua') {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (status && status !== 'Semua') {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR description LIKE ? OR output LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY date DESC, id DESC;';

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/daily-logs', async (req, res) => {
  try {
    const { date, title, description, category, hours_spent, status, output, notes } = req.body;

    if (!date || !title || !category) {
      return res.status(400).json({ error: 'Tanggal, Judul, dan Kategori wajib diisi' });
    }

    const result = await query(
      `INSERT INTO daily_logs (date, title, description, category, hours_spent, status, output, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        date,
        title,
        description || '',
        category,
        parseFloat(hours_spent) || 7.5,
        status || 'Selesai',
        output || '',
        notes || ''
      ]
    );

    const inserted = await query('SELECT * FROM daily_logs WHERE id = ?;', [result.lastInsertRowid]);
    res.status(201).json(inserted.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/daily-logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, title, description, category, hours_spent, status, output, notes } = req.body;

    await query(
      `UPDATE daily_logs 
       SET date = ?, title = ?, description = ?, category = ?, hours_spent = ?, status = ?, output = ?, notes = ?
       WHERE id = ?;`,
      [
        date,
        title,
        description || '',
        category,
        parseFloat(hours_spent) || 7.5,
        status || 'Selesai',
        output || '',
        notes || '',
        id
      ]
    );

    const updated = await query('SELECT * FROM daily_logs WHERE id = ?;', [id]);
    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Log not found' });
    }
    res.json(updated.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/daily-logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM daily_logs WHERE id = ?;', [id]);
    res.json({ success: true, message: 'Log berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. TASKS API
// ==========================================
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await query('SELECT * FROM tasks ORDER BY due_date ASC, id DESC;');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, priority, due_date, status, tags } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Judul tugas wajib diisi' });
    }

    const result = await query(
      `INSERT INTO tasks (title, description, priority, due_date, status, tags)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        title,
        description || '',
        priority || 'Medium',
        due_date || null,
        status || 'Todo',
        tags || ''
      ]
    );

    const inserted = await query('SELECT * FROM tasks WHERE id = ?;', [result.lastInsertRowid]);
    res.status(201).json(inserted.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, due_date, status, tags } = req.body;

    await query(
      `UPDATE tasks 
       SET title = ?, description = ?, priority = ?, due_date = ?, status = ?, tags = ?
       WHERE id = ?;`,
      [
        title,
        description || '',
        priority || 'Medium',
        due_date || null,
        status || 'Todo',
        tags || '',
        id
      ]
    );

    const updated = await query('SELECT * FROM tasks WHERE id = ?;', [id]);
    res.json(updated.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/tasks/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await query('UPDATE tasks SET status = ? WHERE id = ?;', [status, id]);
    const updated = await query('SELECT * FROM tasks WHERE id = ?;', [id]);
    res.json(updated.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM tasks WHERE id = ?;', [id]);
    res.json({ success: true, message: 'Tugas berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. KNOWLEDGE BASE API
// ==========================================
app.get('/api/knowledge', async (req, res) => {
  try {
    const { search, category } = req.query;
    let sql = 'SELECT * FROM knowledge_base WHERE 1=1';
    const params = [];

    if (category && category !== 'Semua') {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY updated_at DESC, id DESC;';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/knowledge', async (req, res) => {
  try {
    const { title, category, content, tags } = req.body;
    if (!title || !category || !content) {
      return res.status(400).json({ error: 'Judul, Kategori, dan Isi materi wajib diisi' });
    }

    const result = await query(
      `INSERT INTO knowledge_base (title, category, content, tags, updated_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP);`,
      [title, category, content, tags || '']
    );

    const inserted = await query('SELECT * FROM knowledge_base WHERE id = ?;', [result.lastInsertRowid]);
    res.status(201).json(inserted.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/knowledge/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, content, tags } = req.body;

    await query(
      `UPDATE knowledge_base 
       SET title = ?, category = ?, content = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?;`,
      [title, category, content, tags || '', id]
    );

    const updated = await query('SELECT * FROM knowledge_base WHERE id = ?;', [id]);
    res.json(updated.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/knowledge/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM knowledge_base WHERE id = ?;', [id]);
    res.json({ success: true, message: 'Materi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. DOCUMENTS API
// ==========================================
app.get('/api/documents', async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM documents WHERE 1=1';
    const params = [];

    if (category && category !== 'Semua') {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      sql += ' AND (original_name LIKE ? OR category LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term);
    }

    sql += ' ORDER BY created_at DESC, id DESC;';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/documents', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File wajib diunggah' });
    }

    const { category } = req.body;
    const fileName = req.file.filename;
    const originalName = req.file.originalname;
    const filePath = `/uploads/${fileName}`;
    const fileSize = req.file.size;
    const fileType = req.file.mimetype;

    const result = await query(
      `INSERT INTO documents (file_name, original_name, file_path, file_size, file_type, category)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [fileName, originalName, filePath, fileSize, fileType, category || 'Dokumen Magang']
    );

    const inserted = await query('SELECT * FROM documents WHERE id = ?;', [result.lastInsertRowid]);
    res.status(201).json(inserted.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const docRes = await query('SELECT * FROM documents WHERE id = ?;', [id]);

    if (docRes.rows.length > 0) {
      const doc = docRes.rows[0];
      const diskPath = path.resolve(__dirname, '..', 'uploads', doc.file_name);
      if (fs.existsSync(diskPath)) {
        try {
          fs.unlinkSync(diskPath);
        } catch (e) {
          console.warn('Could not remove physical file:', e.message);
        }
      }
    }

    await query('DELETE FROM documents WHERE id = ?;', [id]);
    res.json({ success: true, message: 'Dokumen berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5.5. ATTENDANCE (PRESENSI) API
// ==========================================
app.get('/api/attendance', async (req, res) => {
  try {
    const { startDate, endDate, month, year, status } = req.query;
    let sql = 'SELECT * FROM attendance WHERE 1=1';
    const params = [];

    if (startDate) {
      sql += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND date <= ?';
      params.push(endDate);
    }
    if (month && year) {
      const monthStr = month.toString().padStart(2, '0');
      sql += ' AND strftime("%Y-%m", date) = ?';
      params.push(`${year}-${monthStr}`);
    } else if (year) {
      sql += ' AND strftime("%Y", date) = ?';
      params.push(`${year}`);
    }
    if (status && status !== 'Semua') {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY date ASC, id ASC;';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/attendance/today', async (req, res) => {
  try {
    const today = req.query.date || new Date().toLocaleDateString('en-CA');
    const result = await query('SELECT * FROM attendance WHERE date = ?;', [today]);
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/attendance/clock-in', async (req, res) => {
  try {
    const now = new Date();
    const defaultDate = now.toLocaleDateString('en-CA');
    const defaultTime = now.toTimeString().slice(0, 5);

    const {
      date = defaultDate,
      time_in = defaultTime,
      status = 'Hadir (WFO)',
      work_location = 'Kantor BPS',
      notes = ''
    } = req.body;

    const existing = await query('SELECT * FROM attendance WHERE date = ?;', [date]);
    if (existing.rows.length > 0) {
      const record = existing.rows[0];
      await query(
        `UPDATE attendance 
         SET time_in = ?, status = ?, work_location = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?;`,
        [time_in, status, work_location, notes || record.notes, record.id]
      );
      const updated = await query('SELECT * FROM attendance WHERE id = ?;', [record.id]);
      return res.json(updated.rows[0]);
    } else {
      const inserted = await query(
        `INSERT INTO attendance (date, time_in, status, work_location, notes)
         VALUES (?, ?, ?, ?, ?);`,
        [date, time_in, status, work_location, notes]
      );
      const created = await query('SELECT * FROM attendance WHERE id = ?;', [inserted.lastInsertRowid]);
      return res.status(201).json(created.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/attendance/clock-out', async (req, res) => {
  try {
    const now = new Date();
    const defaultDate = now.toLocaleDateString('en-CA');
    const defaultTime = now.toTimeString().slice(0, 5);

    const {
      date = defaultDate,
      time_out = defaultTime,
      notes = ''
    } = req.body;

    const existing = await query('SELECT * FROM attendance WHERE date = ?;', [date]);
    if (existing.rows.length > 0) {
      const record = existing.rows[0];
      const finalNotes = notes ? (record.notes ? `${record.notes} | ${notes}` : notes) : record.notes;
      await query(
        `UPDATE attendance 
         SET time_out = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?;`,
        [time_out, finalNotes, record.id]
      );
      const updated = await query('SELECT * FROM attendance WHERE id = ?;', [record.id]);
      return res.json(updated.rows[0]);
    } else {
      const inserted = await query(
        `INSERT INTO attendance (date, time_out, status, work_location, notes)
         VALUES (?, ?, 'Hadir (WFO)', 'Kantor BPS', ?);`,
        [date, time_out, notes]
      );
      const created = await query('SELECT * FROM attendance WHERE id = ?;', [inserted.lastInsertRowid]);
      return res.status(201).json(created.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const { date, time_in, time_out, status, work_location, notes } = req.body;
    if (!date) {
      return res.status(400).json({ error: 'Tanggal wajib diisi' });
    }

    const existing = await query('SELECT * FROM attendance WHERE date = ?;', [date]);
    if (existing.rows.length > 0) {
      const recordId = existing.rows[0].id;
      await query(
        `UPDATE attendance 
         SET time_in = ?, time_out = ?, status = ?, work_location = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?;`,
        [time_in || null, time_out || null, status || 'Hadir (WFO)', work_location || 'Kantor BPS', notes || '', recordId]
      );
      const updated = await query('SELECT * FROM attendance WHERE id = ?;', [recordId]);
      return res.json(updated.rows[0]);
    }

    const inserted = await query(
      `INSERT INTO attendance (date, time_in, time_out, status, work_location, notes)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [date, time_in || null, time_out || null, status || 'Hadir (WFO)', work_location || 'Kantor BPS', notes || '']
    );
    const created = await query('SELECT * FROM attendance WHERE id = ?;', [inserted.lastInsertRowid]);
    res.status(201).json(created.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/attendance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time_in, time_out, status, work_location, notes } = req.body;

    await query(
      `UPDATE attendance 
       SET date = ?, time_in = ?, time_out = ?, status = ?, work_location = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?;`,
      [date, time_in || null, time_out || null, status || 'Hadir (WFO)', work_location || 'Kantor BPS', notes || '', id]
    );

    const updated = await query('SELECT * FROM attendance WHERE id = ?;', [id]);
    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Data presensi tidak ditemukan' });
    }
    res.json(updated.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/attendance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM attendance WHERE id = ?;', [id]);
    res.json({ success: true, message: 'Data presensi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6. EXPORT API (Enhanced Excel SheetJS)
// ==========================================
app.get('/api/export/excel', async (req, res) => {
  try {
    const { startDate, endDate, category, status, search } = req.query;

    let sql = 'SELECT * FROM daily_logs WHERE 1=1';
    const params = [];

    if (startDate) {
      sql += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND date <= ?';
      params.push(endDate);
    }
    if (category && category !== 'Semua') {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (status && status !== 'Semua') {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR description LIKE ? OR output LIKE ? OR category LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY date ASC, id ASC;';

    const logsResult = await query(sql, params);
    const profileResult = await query('SELECT * FROM profile WHERE id = 1;');
    const attResult = await query('SELECT * FROM attendance;');
    const attMap = new Map((attResult.rows || []).map(a => [a.date, a]));

    const profile = profileResult.rows[0] || {};
    const logs = logsResult.rows;

    const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const now = new Date();
    const formattedPrintDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    let totalHours = 0;
    const excelRows = [
      ['BADAN PUSAT STATISTIK'],
      ['BUKU CATATAN KEGIATAN HARIAN MAGANG MAHASISWA (DAILY LOGBOOK)'],
      [`Fungsi / Penempatan: ${profile.division || 'Badan Pusat Statistik'} | Formulir LK-BPS-2026`],
      [''],
      ['Nama Mahasiswa', `: ${profile.full_name || '-'}`, '', '', 'Pembimbing Lapangan', `: ${profile.mentor_name || '-'}`],
      ['NIM', `: ${profile.nim || '-'}`, '', '', 'NIP Pembimbing', `: ${profile.mentor_nip || '-'}`],
      ['Universitas / Prodi', `: ${profile.university || '-'}`, '', '', 'Penempatan / Seksi', `: ${profile.division || '-'}`],
      ['Periode Rekapitulasi', `: ${startDate || profile.start_date || '-'} s.d ${endDate || profile.end_date || '-'}`, '', '', 'Tanggal Unduh', `: ${formattedPrintDate}`],
      [''],
      ['No', 'Hari', 'Tanggal', 'Judul Aktivitas / Tugas', 'Kategori BPS', 'Uraian & Rincian Kegiatan', 'Hasil / Output Pekerjaan', 'Jam Kerja', 'Status', 'Presensi Kehadiran']
    ];

    logs.forEach((item, index) => {
      const hours = Number(item.hours_spent) || 0;
      totalHours += hours;

      let dayName = '-';
      if (item.date) {
        const d = new Date(item.date + 'T00:00:00');
        if (!isNaN(d.getTime())) {
          dayName = indonesianDays[d.getDay()];
        }
      }

      const att = attMap.get(item.date);
      let presensiStr = '-';
      if (att) {
        presensiStr = `${att.status || 'Hadir (WFO)'} ${att.time_in && att.time_out ? `(${att.time_in} - ${att.time_out})` : ''}`.trim();
      }

      excelRows.push([
        index + 1,
        dayName,
        item.date,
        item.title,
        item.category,
        item.description || '-',
        item.output || '-',
        hours,
        item.status,
        presensiStr
      ]);
    });

    const headerRowCount = 10;
    const dataRowCount = logs.length;
    const totalRowIndex = headerRowCount + dataRowCount; // 0-indexed in array

    // Total Row
    excelRows.push([
      'TOTAL AKUMULASI JAM KERJA',
      '',
      '',
      '',
      '',
      '',
      '',
      totalHours,
      'JAM',
      'Terverifikasi'
    ]);

    // Spacing before signatures
    excelRows.push(['']);
    excelRows.push(['']);

    const sigRowStart = totalRowIndex + 3;
    excelRows.push(['', 'Mengetahui,', '', '', '', '', 'Disetujui oleh,', '', '', '']);
    excelRows.push(['', 'Mahasiswa Magang', '', '', '', '', 'Pembimbing Lapangan BPS', '', '', '']);
    excelRows.push(['', '', '', '', '', '', '', '', '', '']);
    excelRows.push(['', '', '', '', '', '', '', '', '', '']);
    excelRows.push(['', `( ${profile.full_name || 'Nama Mahasiswa'} )`, '', '', '', '', `( ${profile.mentor_name || 'Nama Pembimbing'} )`, '', '', '']);
    excelRows.push(['', `NIM. ${profile.nim || '-'}`, '', '', '', '', `NIP. ${profile.mentor_nip || '-'}`, '', '', '']);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelRows);

    // Merged Cells for Titles and Layout
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }, // Title
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } }, // Subtitle
      { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } }, // Info
      // Metadata col spans
      { s: { r: 4, c: 1 }, e: { r: 4, c: 3 } },
      { s: { r: 5, c: 1 }, e: { r: 5, c: 3 } },
      { s: { r: 6, c: 1 }, e: { r: 6, c: 3 } },
      { s: { r: 7, c: 1 }, e: { r: 7, c: 3 } },
      { s: { r: 4, c: 5 }, e: { r: 4, c: 8 } },
      { s: { r: 5, c: 5 }, e: { r: 5, c: 8 } },
      { s: { r: 6, c: 5 }, e: { r: 6, c: 8 } },
      { s: { r: 7, c: 5 }, e: { r: 7, c: 8 } },
      // Total row merge
      { s: { r: totalRowIndex, c: 0 }, e: { r: totalRowIndex, c: 6 } },
      // Signatures
      { s: { r: sigRowStart, c: 1 }, e: { r: sigRowStart, c: 3 } },
      { s: { r: sigRowStart + 1, c: 1 }, e: { r: sigRowStart + 1, c: 3 } },
      { s: { r: sigRowStart + 4, c: 1 }, e: { r: sigRowStart + 4, c: 3 } },
      { s: { r: sigRowStart + 5, c: 1 }, e: { r: sigRowStart + 5, c: 3 } },
      { s: { r: sigRowStart, c: 6 }, e: { r: sigRowStart, c: 8 } },
      { s: { r: sigRowStart + 1, c: 6 }, e: { r: sigRowStart + 1, c: 8 } },
      { s: { r: sigRowStart + 4, c: 6 }, e: { r: sigRowStart + 4, c: 8 } },
      { s: { r: sigRowStart + 5, c: 6 }, e: { r: sigRowStart + 5, c: 8 } }
    ];

    // Column widths
    ws['!cols'] = [
      { wch: 6 },  // No
      { wch: 11 }, // Hari
      { wch: 14 }, // Tanggal
      { wch: 34 }, // Judul Aktivitas
      { wch: 24 }, // Kategori
      { wch: 54 }, // Rincian Pekerjaan & Metode
      { wch: 38 }, // Output / Bukti Hasil
      { wch: 12 }, // Jam Kerja
      { wch: 12 }, // Status
      { wch: 28 }  // Presensi Kehadiran
    ];

    // AutoFilter across table header
    if (logs.length > 0) {
      ws['!autofilter'] = { ref: `A10:J${10 + logs.length}` };
    }

    // Page orientation setup for printing from Excel
    ws['!pageSetup'] = { orientation: 'landscape', paperSize: 9 };

    XLSX.utils.book_append_sheet(wb, ws, 'Logbook BPS');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const safeFilename = `Logbook_Magang_BPS_${(profile.full_name || 'Mahasiswa').replace(/\s+/g, '_')}_${Date.now()}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename=${safeFilename}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/export/attendance-excel', async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let sql = 'SELECT * FROM attendance WHERE 1=1';
    const params = [];

    if (startDate) {
      sql += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND date <= ?';
      params.push(endDate);
    }
    if (status && status !== 'Semua') {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY date ASC, id ASC;';

    const attResult = await query(sql, params);
    const profileResult = await query('SELECT * FROM profile WHERE id = 1;');
    const profile = profileResult.rows[0] || {};
    const attendances = attResult.rows;

    const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const now = new Date();
    const formattedPrintDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    let totalDurationHours = 0;
    let countHadir = 0;
    let countIzin = 0;
    let countSakit = 0;
    let countDinas = 0;

    const excelRows = [
      ['BADAN PUSAT STATISTIK'],
      ['DAFTAR HADIR & REKAPITULASI PRESENSI MAGANG MAHASISWA'],
      [`Penempatan / Unit Kerja: ${profile.division || 'Badan Pusat Statistik'} | Formulir PRES-BPS-2026`],
      [''],
      ['Nama Mahasiswa', `: ${profile.full_name || '-'}`, '', '', 'Pembimbing Lapangan', `: ${profile.mentor_name || '-'}`],
      ['NIM', `: ${profile.nim || '-'}`, '', '', 'NIP Pembimbing', `: ${profile.mentor_nip || '-'}`],
      ['Universitas / Prodi', `: ${profile.university || '-'}`, '', '', 'Penempatan / Seksi', `: ${profile.division || '-'}`],
      ['Periode Presensi', `: ${startDate || profile.start_date || '-'} s.d ${endDate || profile.end_date || '-'}`, '', '', 'Tanggal Unduh', `: ${formattedPrintDate}`],
      [''],
      ['No', 'Hari', 'Tanggal', 'Jam Datang', 'Jam Pulang', 'Durasi Kerja', 'Status Kehadiran', 'Lokasi Penugasan', 'Keterangan', 'Paraf Pembimbing']
    ];

    attendances.forEach((item, index) => {
      let dayName = '-';
      if (item.date) {
        const d = new Date(item.date + 'T00:00:00');
        if (!isNaN(d.getTime())) {
          dayName = indonesianDays[d.getDay()];
        }
      }

      let durationHours = 0;
      if (item.time_in && item.time_out) {
        const [h1, m1] = item.time_in.split(':').map(Number);
        const [h2, m2] = item.time_out.split(':').map(Number);
        if (!isNaN(h1) && !isNaN(m1) && !isNaN(h2) && !isNaN(m2)) {
          const diffMins = (h2 * 60 + m2) - (h1 * 60 + m1);
          if (diffMins > 0) {
            durationHours = +(diffMins / 60).toFixed(1);
          }
        }
      }

      if (item.status && item.status.includes('Hadir')) countHadir++;
      else if (item.status === 'Dinas Luar' || item.status === 'Dinas Luar / Lapangan') countDinas++;
      else if (item.status === 'Izin') countIzin++;
      else if (item.status === 'Sakit') countSakit++;

      totalDurationHours += durationHours;

      excelRows.push([
        index + 1,
        dayName,
        item.date,
        item.time_in || '-',
        item.time_out || '-',
        durationHours > 0 ? `${durationHours} Jam` : '-',
        item.status || 'Hadir (WFO)',
        item.work_location || 'Kantor BPS',
        item.notes || '-',
        ''
      ]);
    });

    const headerRowCount = 10;
    const dataRowCount = attendances.length;
    const totalRowIndex = headerRowCount + dataRowCount;

    excelRows.push([
      `TOTAL REKAPITULASI: Hadir: ${countHadir} | Dinas Luar: ${countDinas} | Izin: ${countIzin} | Sakit: ${countSakit}`,
      '', '', '', '',
      `${totalDurationHours.toFixed(1)} Jam`,
      '', '', '', ''
    ]);

    excelRows.push(['']);
    excelRows.push(['']);

    const sigRowStart = totalRowIndex + 3;
    excelRows.push(['', 'Mengetahui,', '', '', '', '', 'Disetujui oleh,', '', '', '']);
    excelRows.push(['', 'Mahasiswa Magang', '', '', '', '', 'Pembimbing Lapangan BPS', '', '', '']);
    excelRows.push(['', '', '', '', '', '', '', '', '', '']);
    excelRows.push(['', '', '', '', '', '', '', '', '', '']);
    excelRows.push(['', `( ${profile.full_name || 'Nama Mahasiswa'} )`, '', '', '', '', `( ${profile.mentor_name || 'Nama Pembimbing'} )`, '', '', '']);
    excelRows.push(['', `NIM. ${profile.nim || '-'}`, '', '', '', '', `NIP. ${profile.mentor_nip || '-'}`, '', '', '']);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelRows);

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } },
      { s: { r: 4, c: 1 }, e: { r: 4, c: 3 } },
      { s: { r: 5, c: 1 }, e: { r: 5, c: 3 } },
      { s: { r: 6, c: 1 }, e: { r: 6, c: 3 } },
      { s: { r: 7, c: 1 }, e: { r: 7, c: 3 } },
      { s: { r: 4, c: 5 }, e: { r: 4, c: 8 } },
      { s: { r: 5, c: 5 }, e: { r: 5, c: 8 } },
      { s: { r: 6, c: 5 }, e: { r: 6, c: 8 } },
      { s: { r: 7, c: 5 }, e: { r: 7, c: 8 } },
      { s: { r: totalRowIndex, c: 0 }, e: { r: totalRowIndex, c: 4 } },
      { s: { r: sigRowStart, c: 1 }, e: { r: sigRowStart, c: 3 } },
      { s: { r: sigRowStart + 1, c: 1 }, e: { r: sigRowStart + 1, c: 3 } },
      { s: { r: sigRowStart + 4, c: 1 }, e: { r: sigRowStart + 4, c: 3 } },
      { s: { r: sigRowStart + 5, c: 1 }, e: { r: sigRowStart + 5, c: 3 } },
      { s: { r: sigRowStart, c: 6 }, e: { r: sigRowStart, c: 8 } },
      { s: { r: sigRowStart + 1, c: 6 }, e: { r: sigRowStart + 1, c: 8 } },
      { s: { r: sigRowStart + 4, c: 6 }, e: { r: sigRowStart + 4, c: 8 } },
      { s: { r: sigRowStart + 5, c: 6 }, e: { r: sigRowStart + 5, c: 8 } }
    ];

    ws['!cols'] = [
      { wch: 6 },  // No
      { wch: 11 }, // Hari
      { wch: 14 }, // Tanggal
      { wch: 13 }, // Jam Datang
      { wch: 13 }, // Jam Pulang
      { wch: 15 }, // Durasi Kerja
      { wch: 18 }, // Status
      { wch: 24 }, // Lokasi
      { wch: 34 }, // Keterangan
      { wch: 18 }  // Paraf
    ];

    if (attendances.length > 0) {
      ws['!autofilter'] = { ref: `A10:J${10 + attendances.length}` };
    }

    ws['!pageSetup'] = { orientation: 'landscape', paperSize: 9 };

    XLSX.utils.book_append_sheet(wb, ws, 'Presensi BPS');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const safeFilename = `Presensi_Magang_BPS_${(profile.full_name || 'Mahasiswa').replace(/\s+/g, '_')}_${Date.now()}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename=${safeFilename}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 7. DATABASE BACKUP & STATS API
// ==========================================
app.get('/api/db/backup', (req, res) => {
  try {
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Database file not found' });
    }
    res.download(dbPath, 'laporan_bps.sqlite');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/db/stats', async (req, res) => {
  try {
    let fileSize = 0;
    let lastModified = null;

    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      fileSize = stats.size;
      lastModified = stats.mtime;
    }

    const logCountRes = await query('SELECT COUNT(*) as count FROM daily_logs;');
    const totalHoursRes = await query("SELECT SUM(hours_spent) as total FROM daily_logs WHERE status = 'Selesai';");
    const taskCountRes = await query('SELECT COUNT(*) as count FROM tasks;');
    const kbCountRes = await query('SELECT COUNT(*) as count FROM knowledge_base;');
    const docCountRes = await query('SELECT COUNT(*) as count FROM documents;');
    const attendanceCountRes = await query('SELECT COUNT(*) as count FROM attendance;');

    res.json({
      db_name: 'laporan_bps.sqlite',
      db_path: dbPath,
      file_size_bytes: fileSize,
      file_size_formatted: `${(fileSize / 1024).toFixed(1)} KB`,
      last_modified: lastModified,
      counts: {
        daily_logs: Number(logCountRes.rows[0]?.count || 0),
        total_hours: Number(totalHoursRes.rows[0]?.total || 0),
        tasks: Number(taskCountRes.rows[0]?.count || 0),
        knowledge_base: Number(kbCountRes.rows[0]?.count || 0),
        documents: Number(docCountRes.rows[0]?.count || 0),
        attendance: Number(attendanceCountRes.rows[0]?.count || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/db/seed-reset', async (req, res) => {
  try {
    await cleanDatabase();
    res.json({ success: true, message: 'Database berhasil dibersihkan!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SPA Fallback Handler
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const indexPath = path.resolve(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

// Start Express Server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] InternBPS API Server is running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('[Server] Failed to initialize database:', err);
});
