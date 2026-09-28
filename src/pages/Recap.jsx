import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  CheckCircle, 
  FileText, 
  Clock,
  CalendarCheck,
  LayoutTemplate
} from 'lucide-react';
import { formatDateIndo } from '../utils/formatters';
import { api } from '../utils/api';
import PrintDocument from '../components/PrintDocument';
import PrintAttendance from '../components/PrintAttendance';

export default function Recap({ profile, logs = [], attendances = [] }) {
  const [docType, setDocType] = useState('logbook'); // 'logbook' | 'attendance'
  const [dateFilter, setDateFilter] = useState('all'); // all, this_month, custom
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [layout, setLayout] = useState('landscape'); // 'landscape' | 'portrait'

  // Dynamic categories from logs
  const dynamicCategories = useMemo(() => {
    const cats = new Set(logs.map(l => l.category).filter(Boolean));
    return Array.from(cats);
  }, [logs]);

  // Filtered logbook entries
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Category filter
      if (selectedCategory !== 'Semua' && log.category !== selectedCategory) {
        return false;
      }

      // Date range filter
      if (dateFilter === 'this_month') {
        const logDate = new Date(log.date);
        const now = new Date();
        if (logDate.getMonth() !== now.getMonth() || logDate.getFullYear() !== now.getFullYear()) {
          return false;
        }
      } else if (dateFilter === 'custom') {
        if (customStart && log.date < customStart) return false;
        if (customEnd && log.date > customEnd) return false;
      }

      return true;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [logs, dateFilter, customStart, customEnd, selectedCategory]);

  // Filtered attendance entries
  const filteredAttendances = useMemo(() => {
    return attendances.filter(item => {
      if (selectedStatus !== 'Semua' && item.status !== selectedStatus) {
        return false;
      }

      if (dateFilter === 'this_month') {
        const d = new Date(item.date);
        const now = new Date();
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) {
          return false;
        }
      } else if (dateFilter === 'custom') {
        if (customStart && item.date < customStart) return false;
        if (customEnd && item.date > customEnd) return false;
      }

      return true;
    }).sort((a, b) => (a.date || '').localeCompare(b.date || '') || (a.id - b.id));
  }, [attendances, dateFilter, customStart, customEnd, selectedStatus]);

  // Aggregate statistics for logs
  const stats = useMemo(() => {
    const totalHours = filteredLogs.reduce((acc, curr) => acc + (Number(curr.hours_spent) || 0), 0);
    const totalDays = filteredLogs.length;
    const avgHoursPerDay = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : '0.0';

    return { totalHours, totalDays, avgHoursPerDay };
  }, [filteredLogs]);

  // Aggregate statistics for attendances
  const attendanceStats = useMemo(() => {
    let hadir = 0;
    let dinas = 0;
    let izinSakit = 0;
    let totalWorkHours = 0;

    filteredAttendances.forEach(item => {
      if (item.status && item.status.includes('Hadir')) hadir++;
      else if (item.status === 'Dinas Luar' || item.status === 'Dinas Luar / Lapangan') dinas++;
      else if (item.status === 'Izin' || item.status === 'Sakit') izinSakit++;

      if (item.time_in && item.time_out) {
        const [h1, m1] = item.time_in.split(':').map(Number);
        const [h2, m2] = item.time_out.split(':').map(Number);
        if (!isNaN(h1) && !isNaN(m1) && !isNaN(h2) && !isNaN(m2)) {
          const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
          if (diff > 0) totalWorkHours += diff / 60;
        }
      }
    });

    return {
      totalDays: filteredAttendances.length,
      hadir,
      dinas,
      izinSakit,
      totalWorkHours: totalWorkHours.toFixed(1)
    };
  }, [filteredAttendances]);

  const handleExportExcel = () => {
    let params = {};
    if (dateFilter === 'custom') {
      if (customStart) params.startDate = customStart;
      if (customEnd) params.endDate = customEnd;
    }

    if (docType === 'attendance') {
      if (selectedStatus !== 'Semua') params.status = selectedStatus;
      const url = api.getAttendanceExcelUrl(params);
      window.open(url, '_blank');
    } else {
      if (selectedCategory !== 'Semua') params.category = selectedCategory;
      const url = api.getExcelExportUrl(params);
      window.open(url, '_blank');
    }
  };

  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank', 'width=1120,height=850');
    if (!printWindow) {
      window.print();
      return;
    }

    const previewElement = document.getElementById('recap-print-target');
    const docHtml = previewElement ? previewElement.innerHTML : '';

    const docTitle = docType === 'attendance'
      ? `Rekap_Presensi_BPS_${(profile?.full_name || 'Mahasiswa').replace(/\s+/g, '_')}`
      : `Rekap_Logbook_BPS_${(profile?.full_name || 'Mahasiswa').replace(/\s+/g, '_')}`;

    const printHtml = `
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8" />
          <title>${docTitle}</title>
          <style>
            @page {
              size: A4 ${layout};
              margin: 10mm 12mm 10mm 12mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              margin: 0;
              padding: 0;
              font-size: 9pt;
              line-height: 1.35;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .document-preview-paper {
              width: 100% !important;
              max-width: 100% !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .doc-bps-header {
              border-bottom: 3px double #0f172a;
              padding-bottom: 12px;
              margin-bottom: 16px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .doc-bps-header-left {
              display: flex;
              align-items: center;
              gap: 14px;
            }
            .doc-bps-logo-svg {
              width: 48px;
              height: 48px;
            }
            .doc-bps-inst-title {
              font-size: 13.5pt;
              font-weight: 900;
              color: #0f172a;
              letter-spacing: 0.04em;
              text-transform: uppercase;
              line-height: 1.15;
            }
            .doc-bps-inst-sub {
              font-size: 9pt;
              font-weight: 700;
              color: #334155;
              letter-spacing: 0.02em;
              text-transform: uppercase;
              margin-top: 2px;
            }
            .doc-bps-inst-desc {
              font-size: 8pt;
              color: #64748b;
              margin-top: 1px;
            }
            .doc-bps-header-right {
              text-align: right;
              font-size: 8pt;
              color: #475569;
              line-height: 1.4;
            }
            .doc-bps-doc-title {
              text-align: center;
              font-size: 11.5pt;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.06em;
              color: #0f172a;
              margin: 10px 0 16px;
              padding: 5px 0;
              border-top: 1px solid #cbd5e1;
              border-bottom: 1px solid #cbd5e1;
            }
            .doc-bps-meta-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 24px;
              margin-bottom: 14px;
              font-size: 8.75pt;
              background-color: #f8fafc;
              padding: 10px 14px;
              border: 1px solid #e2e8f0;
              border-radius: 4px;
            }
            .doc-bps-meta-table {
              width: 100%;
              border-collapse: collapse;
            }
            .doc-bps-meta-table td {
              padding: 2px 0;
              vertical-align: top;
            }
            .doc-bps-meta-label {
              width: 135px;
              color: #475569;
              font-weight: 600;
            }
            .doc-bps-meta-val {
              color: #0f172a;
              font-weight: 500;
            }
            .doc-bps-kpi-row {
              display: flex;
              gap: 10px;
              margin-bottom: 14px;
            }
            .doc-bps-kpi-card {
              flex: 1;
              border: 1px solid #cbd5e1;
              border-radius: 4px;
              padding: 6px 10px;
              text-align: center;
              background: #ffffff;
            }
            .doc-bps-kpi-title {
              font-size: 7pt;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              font-weight: 700;
              color: #64748b;
            }
            .doc-bps-kpi-value {
              font-size: 11pt;
              font-weight: 800;
              color: #0f172a;
            }
            .doc-bps-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
              font-size: 8pt;
            }
            .doc-bps-table th {
              background-color: #f1f5f9;
              color: #0f172a;
              font-weight: 800;
              border: 1px solid #94a3b8;
              padding: 6px 8px;
              text-align: left;
              text-transform: uppercase;
              font-size: 7.5pt;
              letter-spacing: 0.03em;
            }
            .doc-bps-table td {
              border: 1px solid #cbd5e1;
              padding: 6px 8px;
              vertical-align: top;
              color: #334155;
            }
            .doc-bps-table tfoot td {
              font-weight: 800;
              background-color: #f8fafc;
              border-top: 2px solid #0f172a;
              padding: 8px;
              color: #0f172a;
            }
            .doc-bps-tag-category {
              display: inline-block;
              padding: 1px 6px;
              border-radius: 3px;
              font-size: 7.5pt;
              font-weight: 700;
              background-color: #f1f5f9;
              color: #334155;
              border: 1px solid #cbd5e1;
            }
            .doc-bps-status-selesai {
              display: inline-block;
              padding: 1px 5px;
              border-radius: 3px;
              font-size: 7pt;
              font-weight: 700;
              background-color: #dcfce7;
              color: #15803d;
            }
            .doc-bps-status-draft {
              display: inline-block;
              padding: 1px 5px;
              border-radius: 3px;
              font-size: 7pt;
              font-weight: 700;
              background-color: #fee2e2;
              color: #b91c1c;
            }
            .doc-bps-output-box {
              margin-top: 4px;
              padding: 4px 6px;
              background-color: #f8fafc;
              border-left: 2px solid #0284c7;
              font-size: 7.5pt;
              color: #0369a1;
            }
            .doc-bps-signature-section {
              display: flex;
              justify-content: space-between;
              margin-top: 24px;
              padding: 0 40px;
              page-break-inside: avoid;
            }
            .doc-bps-signature-box {
              width: 240px;
              text-align: center;
            }
            .doc-bps-signature-space {
              height: 52px;
            }
            .doc-bps-signature-name {
              font-weight: 800;
              font-size: 9.5pt;
              color: #0f172a;
              text-decoration: underline;
            }
            .doc-bps-doc-footer {
              margin-top: 22px;
              padding-top: 8px;
              border-top: 1px dashed #cbd5e1;
              font-size: 7pt;
              color: #94a3b8;
              display: flex;
              justify-content: space-between;
            }
            tr {
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          ${docHtml}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header no-print">
        <div className="page-title-group">
          <h1 className="page-title">
            <FileSpreadsheet size={24} style={{ color: 'var(--accent-primary)' }} />
            <span>Rekapitulasi &amp; Ekspor Laporan</span>
          </h1>
          <p className="page-subtitle">
            Kompilasi lembar aktivitas harian dan daftar presensi resmi Badan Pusat Statistik (BPS) siap cetak ke format PDF atau unduh ke Excel (.xlsx).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={handleExportExcel}>
            <Download size={15} />
            <span>Unduh Excel (.xlsx)</span>
          </button>
          <button className="btn btn-primary" onClick={handlePrintPdf}>
            <Printer size={15} />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Document Type Tab Switcher */}
      <div className="no-print" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          className={`btn ${docType === 'logbook' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem', fontWeight: 600 }}
          onClick={() => setDocType('logbook')}
        >
          <FileText size={16} />
          <span>Buku Kegiatan Harian (Daily Logbook)</span>
        </button>
        <button
          className={`btn ${docType === 'attendance' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem', fontWeight: 600 }}
          onClick={() => setDocType('attendance')}
        >
          <CalendarCheck size={16} />
          <span>Daftar Hadir &amp; Presensi Magang</span>
        </button>
      </div>

      {/* Filter and Configuration Bar */}
      <div className="card no-print" style={{ marginBottom: '1.75rem', padding: '1.15rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Range Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)' }}>Periode:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.85rem' }}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">Seluruh Periode Magang</option>
                <option value="this_month">Bulan Ini Saja</option>
                <option value="custom">Rentang Tanggal Kustom</option>
              </select>
            </div>

            {dateFilter === 'custom' && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="date"
                  className="form-input mono-num"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.84rem' }}
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  placeholder="Mulai"
                />
                <span style={{ color: 'var(--text-dim)' }}>s/d</span>
                <input
                  type="date"
                  className="form-input mono-num"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.84rem' }}
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  placeholder="Akhir"
                />
              </div>
            )}

            {/* Document Specific Filter */}
            {docType === 'logbook' && dynamicCategories.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)' }}>Kategori:</span>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '0.45rem 0.85rem' }}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="Semua">Semua Kategori</option>
                  {dynamicCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            {docType === 'attendance' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '0.45rem 0.85rem' }}
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Hadir (WFO)">Hadir (WFO)</option>
                  <option value="Hadir (WFH)">Hadir (WFH)</option>
                  <option value="Dinas Luar">Dinas Luar / Lapangan</option>
                  <option value="Izin">Izin</option>
                  <option value="Sakit">Sakit</option>
                </select>
              </div>
            )}

            {/* Layout Orientation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-muted)' }}>Kertas:</span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  className={`btn btn-sm ${layout === 'landscape' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setLayout('landscape')}
                  title="Tampilan mendatar (Landscape) - Melegakan kolom aktivitas dan output"
                >
                  Landscape
                </button>
                <button
                  className={`btn btn-sm ${layout === 'portrait' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setLayout('portrait')}
                  title="Tampilan tegak (Portrait)"
                >
                  Portrait
                </button>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Menampilkan: <strong className="mono-num" style={{ color: 'var(--text-heading)' }}>
              {docType === 'attendance' ? `${filteredAttendances.length} Hari Presensi` : `${filteredLogs.length} Entri Kegiatan`}
            </strong>
          </div>
        </div>
      </div>

      {/* Summary KPI preview bar */}
      <div className="card no-print" style={{ marginBottom: '2rem', backgroundColor: 'var(--bg-card-secondary)', border: '1px solid var(--border-card)' }}>
        {docType === 'attendance' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', textAlign: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Total Hari Presensi</span>
              <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '0.15rem' }}>
                {attendanceStats.totalDays} Hari
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Hadir (WFO / WFH)</span>
              <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-sage)', marginTop: '0.15rem' }}>
                {attendanceStats.hadir} Hari
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Dinas Luar / Lapangan</span>
              <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-blue, #0284c7)', marginTop: '0.15rem' }}>
                {attendanceStats.dinas} Hari
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Akumulasi Jam Kerja</span>
              <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '0.15rem' }}>
                {attendanceStats.totalWorkHours} Jam
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', textAlign: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Hari Kerja Aktif</span>
              <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '0.15rem' }}>
                {stats.totalDays} Hari
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Total Jam Akumulasi</span>
              <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '0.15rem' }}>
                {stats.totalHours.toFixed(1)} Jam
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Rata-rata Jam / Hari</span>
              <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-sage)', marginTop: '0.15rem' }}>
                {stats.avgHoursPerDay} Jam
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Total Entri Tercatat</span>
              <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '0.15rem' }}>
                {filteredLogs.length} Log
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Official BPS Document Report View (Print / Live Preview) */}
      <div className="document-preview-wrapper" style={{ marginBottom: '3rem' }}>
        <div id="recap-print-target">
          {docType === 'attendance' ? (
            <PrintAttendance
              profile={profile}
              attendances={filteredAttendances}
              layout={layout}
              options={{
                showSignatures: true,
                showKpi: false
              }}
              customPeriod={
                dateFilter === 'custom' && customStart && customEnd
                  ? `${formatDateIndo(customStart)} s.d ${formatDateIndo(customEnd)}`
                  : null
              }
            />
          ) : (
            <PrintDocument
              profile={profile}
              logs={filteredLogs}
              attendances={attendances}
              layout={layout}
              options={{
                showOutput: true,
                showSignatures: true,
                showKpi: false
              }}
              customPeriod={
                dateFilter === 'custom' && customStart && customEnd
                  ? `${formatDateIndo(customStart)} s.d ${formatDateIndo(customEnd)}`
                  : null
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
